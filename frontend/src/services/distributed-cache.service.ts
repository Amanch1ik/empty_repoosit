import { makeAutoObservable } from 'mobx';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Типы стратегий кэширования
enum CacheStrategy {
    LOCAL_STORAGE,
    INDEXED_DB,
    MEMORY,
    DISTRIBUTED
}

// Интерфейс элемента кэша
interface CacheItem<T> {
    value: T;
    timestamp: number;
    ttl: number;
    version: string;
}

// Конфигурация кэша
interface CacheConfig {
    strategy: CacheStrategy;
    defaultTTL: number;
    maxSize: number;
}

class DistributedCacheService {
    // Локальный кэш в памяти
    private _memoryCache: Map<string, CacheItem<any>> = new Map();
    
    // Конфигурация по умолчанию
    private _config: CacheConfig = {
        strategy: CacheStrategy.INDEXED_DB,
        defaultTTL: 1000 * 60 * 60, // 1 час
        maxSize: 1000 // Максимальное количество элементов
    };

    // Инициализация хранилища для IndexedDB
    private _storage: LocalForage;

    constructor() {
        makeAutoObservable(this);
        
        // Настройка LocalForage
        this._storage = localforage.createInstance({
            name: 'YESSDistributedCache',
            storeName: 'keyvaluepairs'
        });
    }

    // Установка элемента в кэш
    async set<T>(
        key: string, 
        value: T, 
        options: { 
            ttl?: number, 
            strategy?: CacheStrategy 
        } = {}
    ): Promise<void> {
        const strategy = options.strategy || this._config.strategy;
        const ttl = options.ttl || this._config.defaultTTL;
        const version = uuidv4();

        const cacheItem: CacheItem<T> = {
            value,
            timestamp: Date.now(),
            ttl,
            version
        };

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
    }

    // Получение элемента из кэша
    async get<T>(
        key: string, 
        strategy?: CacheStrategy
    ): Promise<T | null> {
        const effectiveStrategy = strategy || this._config.strategy;

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
            return cacheItem.value;
        }

        return null;
    }

    // Удаление элемента из кэша
    async delete(
        key: string, 
        strategy?: CacheStrategy
    ): Promise<void> {
        const effectiveStrategy = strategy || this._config.strategy;

        switch (effectiveStrategy) {
            case CacheStrategy.MEMORY:
                this._memoryCache.delete(key);
                break;
            
            case CacheStrategy.INDEXED_DB:
                await this._storage.removeItem(key);
                break;
            
            case CacheStrategy.LOCAL_STORAGE:
                localStorage.removeItem(key);
                break;
        }
    }

    // Проверка актуальности элемента кэша
    private isValidCacheItem(item: CacheItem<any>): boolean {
        return (Date.now() - item.timestamp) < item.ttl;
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
            if (item.timestamp < oldestTimestamp) {
                oldestKey = key;
                oldestTimestamp = item.timestamp;
            }
        }

        return oldestKey;
    }

    // Очистка всего кэша
    async clear(strategy?: CacheStrategy): Promise<void> {
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

    // Получение статистики кэша
    getStats(): { 
        memorySize: number, 
        strategy: CacheStrategy 
    } {
        return {
            memorySize: this._memoryCache.size,
            strategy: this._config.strategy
        };
    }
}

export default new DistributedCacheService();
