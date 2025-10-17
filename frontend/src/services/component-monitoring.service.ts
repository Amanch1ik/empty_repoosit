import { makeAutoObservable, runInAction } from 'mobx';
import * as React from 'react';
import { Performance } from 'web-vitals';
import SentryService from './sentry.service';
import { LOG_CONFIG } from '@/config';

// Типы метрик компонентов
enum ComponentMetricType {
    RENDER_TIME = 'render_time',
    RE_RENDER = 're_render',
    PROP_CHANGES = 'prop_changes',
    STATE_UPDATES = 'state_updates',
    LIFECYCLE = 'lifecycle'
}

// Состояние компонента
interface ComponentState {
    renderCount: number;
    lastRenderDuration: number;
    averageRenderTime: number;
    propChanges: number;
    stateUpdates: number;
}

// Метрика производительности компонента
interface ComponentPerformanceMetric {
    componentName: string;
    type: ComponentMetricType;
    timestamp: number;
    value: number;
    details?: any;
}

// Конфигурация мониторинга
interface ComponentMonitorConfig {
    slowRenderThreshold: number;
    excessiveRerenderThreshold: number;
}

class ComponentMonitoringService {
    // Кэш состояний компонентов
    private _componentStates: Map<string, ComponentState> = new Map();
    
    // История метрик производительности
    private _performanceHistory: ComponentPerformanceMetric[] = [];
    
    // Конфигурация мониторинга
    private _config: ComponentMonitorConfig = {
        slowRenderThreshold: 50, // мс
        excessiveRerenderThreshold: 10 // количество повторных рендеров
    };

    constructor() {
        makeAutoObservable(this);
    }

    // Создание HOC для мониторинга компонентов
    public withPerformanceMonitoring<P extends object>(
        WrappedComponent: React.ComponentType<P>, 
        componentName?: string
    ): React.ComponentType<P> {
        return class extends React.Component<P, {}> {
            private startTime: number = 0;
            private renderCount: number = 0;

            constructor(props: P) {
                super(props);
                this.startRenderTracking();
            }

            private startRenderTracking() {
                this.startTime = performance.now();
                this.renderCount++;
            }

            private trackRenderPerformance() {
                const renderDuration = performance.now() - this.startTime;
                
                // Логика мониторинга
                ComponentMonitoringService.getInstance().trackComponentMetrics(
                    componentName || WrappedComponent.name, 
                    {
                        renderTime: renderDuration,
                        renderCount: this.renderCount
                    }
                );

                // Логирование медленных рендеров
                if (renderDuration > this._config.slowRenderThreshold) {
                    SentryService.captureMessage(
                        `Медленный рендер компонента: ${componentName || WrappedComponent.name}`, 
                        'warning'
                    );
                }
            }

            componentDidMount() {
                this.trackRenderPerformance();
            }

            componentDidUpdate(prevProps: P) {
                // Отслеживание изменений пропсов
                const propChanges = Object.keys(this.props).filter(
                    key => this.props[key as keyof P] !== prevProps[key as keyof P]
                );

                ComponentMonitoringService.getInstance().trackPropChanges(
                    componentName || WrappedComponent.name, 
                    propChanges.length
                );

                this.startRenderTracking();
                this.trackRenderPerformance();
            }

            render() {
                return <WrappedComponent {...this.props} />;
            }
        };
    }

    // Singleton для глобального доступа
    private static instance: ComponentMonitoringService;
    public static getInstance(): ComponentMonitoringService {
        if (!ComponentMonitoringService.instance) {
            ComponentMonitoringService.instance = new ComponentMonitoringService();
        }
        return ComponentMonitoringService.instance;
    }

    // Трекинг метрик компонента
    public trackComponentMetrics(
        componentName: string, 
        metrics: {
            renderTime: number, 
            renderCount: number
        }
    ) {
        runInAction(() => {
            // Получение или создание состояния компонента
            const componentState = this._componentStates.get(componentName) || {
                renderCount: 0,
                lastRenderDuration: 0,
                averageRenderTime: 0,
                propChanges: 0,
                stateUpdates: 0
            };

            // Обновление метрик
            componentState.renderCount = metrics.renderCount;
            componentState.lastRenderDuration = metrics.renderTime;
            componentState.averageRenderTime = (
                componentState.averageRenderTime * (componentState.renderCount - 1) + 
                metrics.renderTime
            ) / componentState.renderCount;

            // Сохранение состояния
            this._componentStates.set(componentName, componentState);

            // Добавление в историю производительности
            this._performanceHistory.push({
                componentName,
                type: ComponentMetricType.RENDER_TIME,
                timestamp: Date.now(),
                value: metrics.renderTime
            });

            // Ограничение размера истории
            if (this._performanceHistory.length > 100) {
                this._performanceHistory.shift();
            }
        });
    }

    // Трекинг изменений пропсов
    public trackPropChanges(componentName: string, changesCount: number) {
        runInAction(() => {
            const componentState = this._componentStates.get(componentName);
            
            if (componentState) {
                componentState.propChanges += changesCount;

                // Логирование частых изменений пропсов
                if (changesCount > 5) {
                    this._performanceHistory.push({
                        componentName,
                        type: ComponentMetricType.PROP_CHANGES,
                        timestamp: Date.now(),
                        value: changesCount
                    });
                }
            }
        });
    }

    // Получение метрик компонента
    public getComponentMetrics(componentName?: string): 
        ComponentState | Record<string, ComponentState> 
    {
        if (componentName) {
            return this._componentStates.get(componentName) || {};
        }
        return Object.fromEntries(this._componentStates);
    }

    // Генерация отчета о производительности
    public generatePerformanceReport(): string {
        const report: string[] = ['Component Performance Report'];

        this._componentStates.forEach((state, componentName) => {
            report.push(`
${componentName.toUpperCase()}:
- Количество рендеров: ${state.renderCount}
- Последнее время рендера: ${state.lastRenderDuration.toFixed(2)}мс
- Среднее время рендера: ${state.averageRenderTime.toFixed(2)}мс
- Изменений пропсов: ${state.propChanges}
            `);
        });

        return report.join('\n');
    }

    // Очистка метрик
    public resetMetrics() {
        runInAction(() => {
            this._componentStates.clear();
            this._performanceHistory = [];
        });
    }
}

export default ComponentMonitoringService.getInstance();
