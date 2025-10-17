import { useEffect, useState } from 'react';

interface PerformanceMetrics {
    renderTime: number;
    memoryUsage: number;
}

export const usePerformance = () => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        renderTime: 0,
        memoryUsage: 0
    });

    useEffect(() => {
        const startTime = performance.now();

        const measurePerformance = () => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // @ts-ignore
            const memoryUsage = window.performance?.memory 
                ? window.performance.memory.usedJSHeapSize / 1024 / 1024 
                : 0;

            setMetrics({
                renderTime,
                memoryUsage
            });

            // Логирование метрик
            if (process.env.NODE_ENV === 'development') {
                console.group('Performance Metrics');
                console.log(`Render Time: ${renderTime.toFixed(2)}ms`);
                console.log(`Memory Usage: ${memoryUsage.toFixed(2)}MB`);
                console.groupEnd();
            }
        };

        // Отложенное измерение для корректного рендера
        const performanceTimer = setTimeout(measurePerformance, 0);

        return () => {
            clearTimeout(performanceTimer);
        };
    }, []);

    return metrics;
};
