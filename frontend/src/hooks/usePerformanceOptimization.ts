import { useState, useEffect, useCallback, useMemo } from 'react';

interface PerformanceMetrics {
    renderTime: number;
    memoryUsage: number;
    cpuUsage: number;
}

interface PerformanceOptions {
    threshold?: {
        renderTime?: number;
        memoryUsage?: number;
        cpuUsage?: number;
    };
    logPerformance?: boolean;
}

export function usePerformanceOptimization<T>(
    data: T[], 
    options: PerformanceOptions = {}
) {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        renderTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
    });

    const {
        threshold = {},
        logPerformance = process.env.NODE_ENV === 'development'
    } = options;

    // Мемоизация данных для предотвращения лишних перерисовок
    const memoizedData = useMemo(() => {
        const startTime = performance.now();
        
        // Простая оптимизация: фильтрация или трансформация данных
        const processedData = data.filter(item => item !== null && item !== undefined);
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Замер использования памяти (приблизительно)
        const memoryUsage = window.performance?.memory 
            ? window.performance.memory.usedJSHeapSize / 1024 / 1024 
            : 0;

        // Эмуляция замера CPU (в реальном браузере это сложнее)
        const cpuUsage = Math.random() * 10; // Заглушка

        // Проверка порогов производительности
        if (logPerformance) {
            const {
                renderTime: renderThreshold = 50,
                memoryUsage: memoryThreshold = 100,
                cpuUsage: cpuThreshold = 50
            } = threshold;

            if (renderTime > renderThreshold) {
                console.warn(`Slow render: ${renderTime.toFixed(2)}ms`);
            }

            if (memoryUsage > memoryThreshold) {
                console.warn(`High memory usage: ${memoryUsage.toFixed(2)}MB`);
            }

            if (cpuUsage > cpuThreshold) {
                console.warn(`High CPU usage: ${cpuUsage.toFixed(2)}%`);
            }
        }

        setMetrics({ renderTime, memoryUsage, cpuUsage });

        return processedData;
    }, [data, threshold, logPerformance]);

    // Оптимизированный коллбэк с мемоизацией
    const optimizedCallback = useCallback((item: T) => {
        // Пример оптимизированной операции
        return JSON.stringify(item).length;
    }, []);

    // Дополнительные оптимизации
    const optimizedOperations = useMemo(() => {
        return {
            total: memoizedData.length,
            averageSize: memoizedData.reduce((acc, item) => 
                acc + optimizedCallback(item), 0) / memoizedData.length
        };
    }, [memoizedData, optimizedCallback]);

    return {
        data: memoizedData,
        metrics,
        optimizedOperations
    };
}

// Хук для ленивой загрузки компонентов
export function useLazyLoad<T>(
    component: () => Promise<{ default: React.ComponentType<T> }>,
    props: T
) {
    const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);

    useEffect(() => {
        let isMounted = true;
        component().then(module => {
            if (isMounted) {
                setComponent(() => module.default);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [component]);

    return Component ? <Component {...props} /> : null;
}

// Хук для оптимизации частых обновлений
export function useThrottle<T>(value: T, delay: number = 500): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setThrottledValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return throttledValue;
}
