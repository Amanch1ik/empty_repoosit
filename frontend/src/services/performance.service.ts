import { makeAutoObservable } from 'mobx';
import ApiService from './api.service';
import { CONFIG } from '@/config';

interface PerformanceMetric {
    timestamp: number;
    duration: number;
    endpoint: string;
    method: string;
}

interface ResourceUsage {
    cpu: number;
    memory: number;
    network: {
        download: number;
        upload: number;
    }
}

class PerformanceService {
    // Кэш запросов
    private _requestCache: Map<string, any> = new Map();
    
    // История производительности
    private _performanceHistory: PerformanceMetric[] = [];
    
    // Максимальное количество сохраняемых метрик
    private readonly MAX_HISTORY_LENGTH = 100;
    
    // Порог медленных запросов (мс)
    private readonly SLOW_REQUEST_THRESHOLD = 500;

    constructor() {
        makeAutoObservable(this);
        this.initPerformanceMonitoring();
    }

    // Инициализация мониторинга производительности
    private initPerformanceMonitoring() {
        if (CONFIG.ENV.DEVELOPMENT) {
            this.setupPerformanceObserver();
        }
    }

    // Настройка observers для мониторинга производительности
    private setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(this.handlePerformanceEntry);
            });

            observer.observe({
                entryTypes: ['measure', 'navigation', 'resource']
            });
        }
    }

    // Обработка записей производительности
    private handlePerformanceEntry = (entry: PerformanceEntry) => {
        if (entry.entryType === 'measure') {
            this.trackRequestPerformance({
                timestamp: entry.startTime,
                duration: entry.duration,
                endpoint: entry.name,
                method: 'custom'
            });
        }
    }

    // Кэширование запросов
    public async cachedRequest<T>(
        key: string, 
        fetchFn: () => Promise<T>, 
        maxAge: number = 5 * 60 * 1000 // 5 минут по умолчанию
    ): Promise<T> {
        const cachedData = this._requestCache.get(key);
        
        if (cachedData && (Date.now() - cachedData.timestamp) < maxAge) {
            return cachedData.data;
        }

        const startTime = performance.now();
        const result = await fetchFn();
        const duration = performance.now() - startTime;

        // Кэширование результата
        this._requestCache.set(key, {
            data: result,
            timestamp: Date.now()
        });

        // Отслеживание производительности
        this.trackRequestPerformance({
            timestamp: startTime,
            duration,
            endpoint: key,
            method: 'cached'
        });

        return result;
    }

    // Отслеживание производительности запросов
    private trackRequestPerformance(metric: PerformanceMetric) {
        // Добавление метрики в историю
        this._performanceHistory.push(metric);

        // Усечение истории
        if (this._performanceHistory.length > this.MAX_HISTORY_LENGTH) {
            this._performanceHistory.shift();
        }

        // Логирование медленных запросов
        if (metric.duration > this.SLOW_REQUEST_THRESHOLD) {
            console.warn(`Slow request: ${metric.endpoint} - ${metric.duration}ms`);
        }
    }

    // Получение текущей загрузки ресурсов
    public getResourceUsage(): ResourceUsage {
        if (!('performance' in window)) {
            return {
                cpu: 0,
                memory: 0,
                network: { download: 0, upload: 0 }
            };
        }

        const memory = performance.memory;
        
        return {
            cpu: navigator.hardwareConcurrency || 0,
            memory: memory 
                ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 
                : 0,
            network: this.getNetworkUsage()
        };
    }

    // Получение использования сети
    private getNetworkUsage(): { download: number, upload: number } {
        const connection = (navigator as any).connection;
        
        if (!connection) {
            return { download: 0, upload: 0 };
        }

        return {
            download: connection.downlink || 0,
            upload: connection.uplink || 0
        };
    }

    // Получение истории производительности
    get performanceHistory(): PerformanceMetric[] {
        return this._performanceHistory;
    }

    // Очистка кэша
    public clearCache() {
        this._requestCache.clear();
    }

    // Отправка метрик на сервер
    public async reportPerformanceMetrics() {
        try {
            await ApiService.post('/metrics/frontend', {
                performanceHistory: this._performanceHistory,
                resourceUsage: this.getResourceUsage()
            });
        } catch (error) {
            console.error('Failed to report performance metrics', error);
        }
    }
}

export default new PerformanceService();
