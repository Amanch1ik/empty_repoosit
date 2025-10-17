import { makeAutoObservable } from 'mobx';
import { LOG_CONFIG } from '@/config';
import SentryService from './sentry.service';

// Типы оптимизации
enum OptimizationType {
    RENDERING = 'rendering',
    MEMORY = 'memory',
    NETWORK = 'network',
    COMPUTATION = 'computation'
}

// Метрики производительности
interface PerformanceMetric {
    type: OptimizationType;
    timestamp: number;
    duration: number;
    details?: any;
}

// Стратегии оптимизации
interface OptimizationStrategy {
    type: OptimizationType;
    threshold: number;
    action: () => void;
}

class PerformanceOptimizerService {
    // История метрик производительности
    private _performanceHistory: PerformanceMetric[] = [];
    
    // Стратегии оптимизации
    private _optimizationStrategies: OptimizationStrategy[] = [];

    // Кэш результатов вычислений
    private _computationCache: Map<string, any> = new Map();

    constructor() {
        makeAutoObservable(this);
        this.initDefaultStrategies();
    }

    // Инициализация стратегий по умолчанию
    private initDefaultStrategies() {
        // Стратегия оптимизации рендеринга
        this.addOptimizationStrategy({
            type: OptimizationType.RENDERING,
            threshold: 50, // мс
            action: this.optimizeRendering
        });

        // Стратегия управления памятью
        this.addOptimizationStrategy({
            type: OptimizationType.MEMORY,
            threshold: 80, // проценты использования
            action: this.optimizeMemory
        });
    }

    // Добавление стратегии оптимизации
    public addOptimizationStrategy(strategy: OptimizationStrategy) {
        this._optimizationStrategies.push(strategy);
    }

    // Измерение производительности
    public measurePerformance<T>(
        type: OptimizationType, 
        operation: () => T
    ): T {
        const start = performance.now();
        
        try {
            const result = operation();
            
            const duration = performance.now() - start;
            this.trackPerformanceMetric({
                type,
                timestamp: Date.now(),
                duration
            });

            // Проверка стратегий оптимизации
            this.checkOptimizationStrategies(type, duration);

            return result;
        } catch (error) {
            // Логирование ошибок производительности
            SentryService.captureException(error, {
                tags: { performanceType: type }
            });
            throw error;
        }
    }

    // Кэширование вычислений
    public cachedComputation<T>(
        key: string, 
        computation: () => T, 
        maxAge: number = 5 * 60 * 1000 // 5 минут
    ): T {
        const cachedResult = this._computationCache.get(key);
        
        if (cachedResult) {
            const { value, timestamp } = cachedResult;
            
            if (Date.now() - timestamp < maxAge) {
                return value;
            }
        }

        // Выполнение и кэширование вычисления
        const result = this.measurePerformance(
            OptimizationType.COMPUTATION, 
            computation
        );

        this._computationCache.set(key, {
            value: result,
            timestamp: Date.now()
        });

        return result;
    }

    // Проверка стратегий оптимизации
    private checkOptimizationStrategies(type: OptimizationType, duration: number) {
        const relevantStrategies = this._optimizationStrategies.filter(
            strategy => strategy.type === type
        );

        relevantStrategies.forEach(strategy => {
            if (duration > strategy.threshold) {
                strategy.action();
            }
        });
    }

    // Оптимизация рендеринга
    private optimizeRendering() {
        // Принудительная оптимизация рендеринга
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
                // Логика оптимизации рендеринга
                console.log('Оптимизация рендеринга');
            });
        }
    }

    // Оптимизация памяти
    private optimizeMemory() {
        // Принудительная сборка мусора
        if ('gc' in window) {
            (window as any).gc();
        }

        // Очистка кэша вычислений
        this.clearComputationCache();
    }

    // Очистка кэша вычислений
    public clearComputationCache() {
        this._computationCache.clear();
    }

    // Получение истории производительности
    get performanceHistory(): PerformanceMetric[] {
        return this._performanceHistory;
    }

    // Отслеживание метрик производительности
    private trackPerformanceMetric(metric: PerformanceMetric) {
        this._performanceHistory.push(metric);

        // Ограничение размера истории
        if (this._performanceHistory.length > 100) {
            this._performanceHistory.shift();
        }

        // Логирование медленных операций
        if (metric.duration > LOG_CONFIG.PERFORMANCE_TRACKING.SLOW_REQUEST_THRESHOLD) {
            SentryService.captureMessage(
                `Медленная операция: ${metric.type} - ${metric.duration}мс`, 
                'warning'
            );
        }
    }

    // Генерация отчета о производительности
    public generatePerformanceReport(): string {
        const report: string[] = ['Performance Report'];

        const typeStats = this._performanceHistory.reduce((stats, metric) => {
            if (!stats[metric.type]) {
                stats[metric.type] = {
                    count: 0,
                    totalDuration: 0,
                    avgDuration: 0
                };
            }

            stats[metric.type].count++;
            stats[metric.type].totalDuration += metric.duration;
            stats[metric.type].avgDuration = 
                stats[metric.type].totalDuration / stats[metric.type].count;

            return stats;
        }, {} as Record<OptimizationType, { count: number, totalDuration: number, avgDuration: number }>);

        Object.entries(typeStats).forEach(([type, stats]) => {
            report.push(`
${type.toUpperCase()}:
- Количество операций: ${stats.count}
- Средняя длительность: ${stats.avgDuration.toFixed(2)}мс
            `);
        });

        return report.join('\n');
    }
}

export default new PerformanceOptimizerService();
