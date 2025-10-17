import { makeAutoObservable, runInAction } from 'mobx';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import SentryService from './sentry.service';
import { LOG_CONFIG } from '@/config';

// Стратегии кэширования
enum CacheStrategy {
    LOCAL_STORAGE,
    INDEXED_DB,
    MEMORY,
    REDIS,
    WEBSOCKET
}

// Политики инвалидации кэша
enum CacheInvalidationPolicy {
    TIME_TO_LIVE,
    MANUAL,
    DEPENDENCY_BASED,
    LEAST_RECENTLY_USED
}

// Метаданные кэша
interface CacheMetadata {
    createdAt: number;
    lastAccessedAt: number;
    ttl: number;
    version: string;
    tags: string[];
}

// Элемент кэша
interface CacheItem<T> {
    value: T;
    metadata: CacheMetadata;
}

// Конфигурация кэша
interface CacheConfig {
    strategy: CacheStrategy;
    invalidationPolicy: CacheInvalidationPolicy;
    defaultTTL: number;
    maxSize: number;
}

class DistributedCacheManagerService {
    // Локальный кэш в памяти
    private _memoryCache: Map<string, CacheItem<any>> = new Map();
    
    // Конфигурация кэша
    private _config: CacheConfig = {
        strategy: CacheStrategy.INDEXED_DB,
        invalidationPolicy: CacheInvalidationPolicy.TIME_TO_LIVE,
        defaultTTL: 1000 * 60 * 60, // 1 час
        maxSize: 1000 // Максимальное количество элементов
    };

    // Хранилище для IndexedDB
    private _storage: LocalForage;

    constructor() {
        makeAutoObservable(this);
        
        // Настройка LocalForage
        this._storage = localforage.createInstance({
            name: 'YESSDistributedCache',
            storeName: 'keyvaluepairs'
        });

        // Периодическая очистка кэша
        this.startCacheCleanupInterval();
    }

    // Периодическая очистка просроченного кэша
    private startCacheCleanupInterval() {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 1000 * 60 * 5); // Каждые 5 минут
    }

    // Установка элемента в кэш
    public async set<T>(
        key: string, 
        value: T, 
        options: { 
            ttl?: number, 
            strategy?: CacheStrategy,
            tags?: string[]
        } = {}
    ): Promise<void> {
        const strategy = options.strategy || this._config.strategy;
        const ttl = options.ttl || this._config.defaultTTL;
        const version = uuidv4();

        const cacheItem: CacheItem<T> = {
            value,
            metadata: {
                createdAt: Date.now(),
                lastAccessedAt: Date.now(),
                ttl,
                version,
                tags: options.tags || []
            }
        };

        try {
            switch (strategy) {
                case CacheStrategy.MEMORY:
                    this._memoryCache.set(key, cacheItem);
                    break;
                
                case CacheStrategy.INDEXED_DB:
                    await this._storage.setItem(key, cacheItem);
                    break;
                
                case CacheStrategy.LOCAL_STORAGE:
                    localStorage.setItem(key, JSON.stringify(cacheItem));
                    break;
            }

            // Управление размером кэша
            await this.manageCacheSize(strategy);
        } catch (error) {
            SentryService.captureException(error, {
                tags: { 
                    cacheOperation: 'set',
                    strategy: CacheStrategy[strategy]
                }
            });
        }
    }

    // Получение элемента из кэша
    public async get<T>(
        key: string, 
        strategy?: CacheStrategy
    ): Promise<T | null> {
        const effectiveStrategy = strategy || this._config.strategy;

        try {
            let cacheItem: CacheItem<T> | null = null;

            switch (effectiveStrategy) {
                case CacheStrategy.MEMORY:
                    cacheItem = this._memoryCache.get(key) as CacheItem<T>;
                    break;
                
                case CacheStrategy.INDEXED_DB:
                    cacheItem = await this._storage.getItem(key) as CacheItem<T>;
                    break;
                
                case CacheStrategy.LOCAL_STORAGE:
                    const storedItem = localStorage.getItem(key);
                    cacheItem = storedItem ? JSON.parse(storedItem) : null;
                    break;
            }

            // Проверка актуальности кэша
            if (cacheItem && this.isValidCacheItem(cacheItem)) {
                // Обновление времени последнего доступа
                cacheItem.metadata.lastAccessedAt = Date.now();
                return cacheItem.value;
            }

            return null;
        } catch (error) {
            SentryService.captureException(error, {
                tags: { 
                    cacheOperation: 'get',
                    strategy: CacheStrategy[effectiveStrategy]
                }
            });
            return null;
        }
    }

    // Проверка актуальности элемента кэша
    private isValidCacheItem(item: CacheItem<any>): boolean {
        const { createdAt, ttl } = item.metadata;
        return (Date.now() - createdAt) < ttl;
    }

    // Управление размером кэша
    private async manageCacheSize(strategy: CacheStrategy): Promise<void> {
        if (strategy === CacheStrategy.MEMORY) {
            while (this._memoryCache.size > this._config.maxSize) {
                // Удаление самого старого элемента
                const oldestKey = this.findOldestKey(this._memoryCache);
                if (oldestKey) this._memoryCache.delete(oldestKey);
            }
        }
    }

    // Поиск самого старого ключа в кэше
    private findOldestKey(cache: Map<string, CacheItem<any>>): string | null {
        let oldestKey: string | null = null;
        let oldestTimestamp = Infinity;

        for (const [key, item] of cache.entries()) {
            if (item.metadata.lastAccessedAt < oldestTimestamp) {
                oldestKey = key;
                oldestTimestamp = item.metadata.lastAccessedAt;
            }
        }

        return oldestKey;
    }

    // Очистка просроченного кэша
    private cleanupExpiredCache() {
        runInAction(() => {
            // Очистка memory кэша
            for (const [key, item] of this._memoryCache.entries()) {
                if (!this.isValidCacheItem(item)) {
                    this._memoryCache.delete(key);
                }
            }

            // Очистка localStorage
            Object.keys(localStorage).forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    try {
                        const parsedItem = JSON.parse(item);
                        if (!this.isValidCacheItem(parsedItem)) {
                            localStorage.removeItem(key);
                        }
                    } catch {}
                }
            });
        });
    }

    // Инвалидация кэша по тегам
    public async invalidateByTags(tags: string[]) {
        // Очистка memory кэша
        for (const [key, item] of this._memoryCache.entries()) {
            if (item.metadata.tags.some(tag => tags.includes(tag))) {
                this._memoryCache.delete(key);
            }
        }

        // Очистка localStorage
        Object.keys(localStorage).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                try {
                    const parsedItem = JSON.parse(item);
                    if (parsedItem.metadata.tags.some((tag: string) => tags.includes(tag))) {
                        localStorage.removeItem(key);
                    }
                } catch {}
            }
        });
    }

    // Получение статистики кэша
    public getCacheStats(): { 
        memorySize: number, 
        strategy: CacheStrategy,
        totalItems: number,
        expiredItems: number
    } {
        const memoryItems = Array.from(this._memoryCache.entries());
        
        return {
            memorySize: this._memoryCache.size,
            strategy: this._config.strategy,
            totalItems: memoryItems.length,
            expiredItems: memoryItems.filter(
                ([_, item]) => !this.isValidCacheItem(item)
            ).length
        };
    }

    // Полная очистка кэша
    public async clear(strategy?: CacheStrategy) {
        const effectiveStrategy = strategy || this._config.strategy;

        switch (effectiveStrategy) {
            case CacheStrategy.MEMORY:
                this._memoryCache.clear();
                break;
            
            case CacheStrategy.INDEXED_DB:
                await this._storage.clear();
                break;
            
            case CacheStrategy.LOCAL_STORAGE:
                localStorage.clear();
                break;
        }
    }
}

export default new DistributedCacheManagerService();
