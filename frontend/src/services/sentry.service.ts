import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { makeAutoObservable } from 'mobx';
import { LOG_CONFIG } from '@/config';

interface SentryConfig {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
}

class SentryService {
    private _isInitialized: boolean = false;

    constructor() {
        makeAutoObservable(this);
        this.initialize();
    }

    private initialize() {
        try {
            const config: SentryConfig = {
                dsn: LOG_CONFIG.SENTRY_DSN,
                environment: process.env.NODE_ENV || 'development',
                tracesSampleRate: LOG_CONFIG.PERFORMANCE_TRACKING.SAMPLE_RATE
            };

            Sentry.init({
                dsn: config.dsn,
                integrations: [new BrowserTracing()],
                tracesSampleRate: config.tracesSampleRate,
                environment: config.environment,
                
                // Фильтрация конфиденциальных данных
                beforeSend(event) {
                    // Удаление чувствительной информации
                    if (event.request) {
                        delete event.request.headers;
                        delete event.request.data;
                    }
                    return event;
                }
            });

            this._isInitialized = true;
        } catch (error) {
            console.error('Ошибка инициализации Sentry:', error);
        }
    }

    // Ручная отправка исключения
    public captureException(error: Error, context?: any) {
        if (!this._isInitialized) return;

        Sentry.captureException(error, { 
            extra: context 
        });
    }

    // Отправка пользовательского сообщения
    public captureMessage(message: string, level: Sentry.Severity = Sentry.Severity.Info) {
        if (!this._isInitialized) return;

        Sentry.captureMessage(message, level);
    }

    // Установка пользовательского контекста
    public setUser(user?: { id?: string, email?: string, username?: string }) {
        if (!this._isInitialized) return;

        Sentry.setUser(user || null);
    }

    // Добавление тега для фильтрации
    public addTag(key: string, value: string) {
        if (!this._isInitialized) return;

        Sentry.setTag(key, value);
    }

    // Создание транзакции для трекинга производительности
    public startTransaction(name: string) {
        if (!this._isInitialized) return null;

        return Sentry.startTransaction({ name });
    }

    // Создание spans для детального трекинга
    public createSpan(transaction: any, description: string) {
        return transaction?.startChild({ description });
    }
}

export default new SentryService();
