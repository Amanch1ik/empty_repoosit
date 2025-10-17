import { makeAutoObservable } from 'mobx';
import { LOG_CONFIG } from '@/config';
import SentryService from './sentry.service';
import APIMonitoringService from './api-monitoring.service';

// Типы метрик системы
interface SystemMetrics {
    cpu: number;
    memory: {
        total: number;
        used: number;
        free: number;
    };
    network: {
        type: string;
        downlink: number;
        rtt: number;
    };
    battery?: {
        level: number;
        charging: boolean;
    };
}

// Типы событий мониторинга
enum MonitoringEventType {
    PERFORMANCE_DEGRADATION = 'performance_degradation',
    MEMORY_LEAK = 'memory_leak',
    NETWORK_INSTABILITY = 'network_instability',
    RESOURCE_OVERLOAD = 'resource_overload'
}

interface MonitoringEvent {
    type: MonitoringEventType;
    timestamp: number;
    details: any;
}

class SystemMonitoringService {
    // История метрик
    private _metricsHistory: SystemMetrics[] = [];
    private _eventsHistory: MonitoringEvent[] = [];

    // Конфигурация мониторинга
    private _config = {
        performanceThreshold: LOG_CONFIG.PERFORMANCE_TRACKING.SLOW_REQUEST_THRESHOLD,
        memoryThreshold: 80, // проценты
        cpuThreshold: 90 // проценты
    };

    constructor() {
        makeAutoObservable(this);
        this.startMonitoring();
    }

    // Запуск периодического мониторинга
    private startMonitoring() {
        // Сбор метрик каждые 30 секунд
        setInterval(() => {
            this.collectSystemMetrics();
            this.analyzeSystemPerformance();
        }, LOG_CONFIG.MONITORING.RESOURCE_CHECK_INTERVAL);
    }

    // Сбор системных метрик
    private collectSystemMetrics(): SystemMetrics | null {
        // Проверка поддержки Performance API
        if (!('performance' in window) || !('memory' in navigator)) return null;

        const metrics: SystemMetrics = {
            cpu: navigator.hardwareConcurrency || 0,
            memory: {
                total: (performance.memory?.totalJSHeapSize || 0) / (1024 * 1024),
                used: (performance.memory?.usedJSHeapSize || 0) / (1024 * 1024),
                free: (performance.memory?.totalJSHeapSize || 0 - performance.memory?.usedJSHeapSize || 0) / (1024 * 1024)
            },
            network: this.getNetworkMetrics()
        };

        // Получение данных о батарее (если доступно)
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                metrics.battery = {
                    level: battery.level * 100,
                    charging: battery.charging
                };
            });
        }

        // Сохранение метрик в историю
        this._metricsHistory.push(metrics);

        // Ограничение размера истории
        if (this._metricsHistory.length > 100) {
            this._metricsHistory.shift();
        }

        return metrics;
    }

    // Получение сетевых метрик
    private getNetworkMetrics(): SystemMetrics['network'] {
        const connection = (navigator as any).connection;
        return connection ? {
            type: connection.type || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0
        } : {
            type: 'unknown',
            downlink: 0,
            rtt: 0
        };
    }

    // Анализ производительности системы
    private analyzeSystemPerformance() {
        const latestMetrics = this._metricsHistory[this._metricsHistory.length - 1];
        
        if (!latestMetrics) return;

        // Проверка использования памяти
        if (latestMetrics.memory.used / latestMetrics.memory.total * 100 > this._config.memoryThreshold) {
            this.logMonitoringEvent({
                type: MonitoringEventType.MEMORY_LEAK,
                timestamp: Date.now(),
                details: {
                    usedMemory: latestMetrics.memory.used,
                    totalMemory: latestMetrics.memory.total
                }
            });
        }

        // Проверка нагрузки на CPU
        const apiStats = APIMonitoringService.getRequestStatistics();
        if (apiStats.slowRequestCount > 5) {
            this.logMonitoringEvent({
                type: MonitoringEventType.PERFORMANCE_DEGRADATION,
                timestamp: Date.now(),
                details: {
                    slowRequests: apiStats.slowRequestCount,
                    avgResponseTime: apiStats.avgResponseTime
                }
            });
        }
    }

    // Логирование событий мониторинга
    private logMonitoringEvent(event: MonitoringEvent) {
        this._eventsHistory.push(event);

        // Отправка критических событий в Sentry
        if (event.type !== MonitoringEventType.NETWORK_INSTABILITY) {
            SentryService.captureMessage(
                `Системное событие: ${event.type}`, 
                'warning'
            );
        }

        // Ограничение размера истории событий
        if (this._eventsHistory.length > 50) {
            this._eventsHistory.shift();
        }
    }

    // Публичные методы

    // Получение текущих метрик
    getCurrentMetrics(): SystemMetrics | null {
        return this._metricsHistory[this._metricsHistory.length - 1] || null;
    }

    // Получение истории событий
    getEventsHistory(): MonitoringEvent[] {
        return this._eventsHistory;
    }

    // Проверка здоровья системы
    isSystemHealthy(): boolean {
        const latestMetrics = this.getCurrentMetrics();
        
        if (!latestMetrics) return true;

        return (
            latestMetrics.memory.used / latestMetrics.memory.total * 100 <= this._config.memoryThreshold &&
            APIMonitoringService.getRequestStatistics().slowRequestCount <= 5
        );
    }

    // Принудительный сбор метрик
    forceMetricsCollection() {
        return this.collectSystemMetrics();
    }
}

export default new SystemMonitoringService();
