import { makeAutoObservable } from 'mobx';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { LOG_CONFIG } from '@/config';
import SentryService from './sentry.service';

interface APIRequestMetric {
    url: string;
    method: string;
    startTime: number;
    endTime: number;
    duration: number;
    status: number;
    success: boolean;
}

class APIMonitoringService {
    // История метрик запросов
    private _requestMetrics: APIRequestMetric[] = [];
    
    // Максимальное количество сохраняемых метрик
    private readonly MAX_METRICS_HISTORY = 100;
    
    // Порог медленных запросов (мс)
    private readonly SLOW_REQUEST_THRESHOLD = LOG_CONFIG.PERFORMANCE_TRACKING.SLOW_REQUEST_THRESHOLD;

    constructor() {
        makeAutoObservable(this);
        this.setupAxiosInterceptors();
    }

    // Настройка перехватчиков Axios для мониторинга
    private setupAxiosInterceptors() {
        // Перехватчик запросов
        axios.interceptors.request.use((config) => {
            config.metadata = { startTime: Date.now() };
            return config;
        }, (error) => Promise.reject(error));

        // Перехватчик ответов
        axios.interceptors.response.use(
            (response) => {
                this.trackRequestMetrics(response);
                return response;
            },
            (error) => {
                if (error.config) {
                    this.trackRequestMetrics(error.response, true);
                }
                return Promise.reject(error);
            }
        );
    }

    // Отслеживание метрик запроса
    private trackRequestMetrics(response: AxiosResponse, isError: boolean = false) {
        const config = response?.config || {};
        const startTime = config.metadata?.startTime || Date.now();
        const endTime = Date.now();
        const duration = endTime - startTime;

        const metric: APIRequestMetric = {
            url: config.url || 'Unknown',
            method: config.method?.toUpperCase() || 'UNKNOWN',
            startTime,
            endTime,
            duration,
            status: response?.status || 0,
            success: !isError
        };

        // Добавление метрики в историю
        this._requestMetrics.push(metric);

        // Усечение истории
        if (this._requestMetrics.length > this.MAX_METRICS_HISTORY) {
            this._requestMetrics.shift();
        }

        // Логирование медленных запросов
        if (duration > this.SLOW_REQUEST_THRESHOLD) {
            this.logSlowRequest(metric);
        }
    }

    // Логирование медленных запросов
    private logSlowRequest(metric: APIRequestMetric) {
        const message = `Медленный запрос: ${metric.method} ${metric.url} (${metric.duration}мс)`;
        
        // Логирование в Sentry
        SentryService.captureMessage(message, 'warning');
        
        console.warn(message);
    }

    // Получение истории метрик
    get requestMetrics(): APIRequestMetric[] {
        return this._requestMetrics;
    }

    // Получение статистики запросов
    getRequestStatistics() {
        const totalRequests = this._requestMetrics.length;
        const successfulRequests = this._requestMetrics.filter(m => m.success).length;
        const failedRequests = totalRequests - successfulRequests;

        const avgResponseTime = this._requestMetrics.length > 0
            ? this._requestMetrics.reduce((sum, m) => sum + m.duration, 0) / this._requestMetrics.length
            : 0;

        const slowRequestCount = this._requestMetrics.filter(
            m => m.duration > this.SLOW_REQUEST_THRESHOLD
        ).length;

        return {
            totalRequests,
            successfulRequests,
            failedRequests,
            avgResponseTime,
            slowRequestCount,
            successRate: (successfulRequests / totalRequests) * 100 || 0
        };
    }

    // Очистка истории метрик
    clearMetrics() {
        this._requestMetrics = [];
    }
}

export default new APIMonitoringService();
