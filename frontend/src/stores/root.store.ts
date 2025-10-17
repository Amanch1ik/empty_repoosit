import { makeAutoObservable, runInAction } from 'mobx';
import { DIContainer } from '@/core/dependency-injection';

// Импорт субсторов
import AuthStore from './auth.store';
import UserStore from './user.store';
import NotificationStore from './notification.store';
import PerformanceStore from './performance.store';

// Интерфейс для субсторов
interface SubStore {
    initialize?: () => Promise<void>;
    reset?: () => void;
}

class RootStore implements SubStore {
    // Субсторы
    public authStore: AuthStore;
    public userStore: UserStore;
    public notificationStore: NotificationStore;
    public performanceStore: PerformanceStore;

    // Глобальное состояние приложения
    public isInitialized: boolean = false;
    public isLoading: boolean = false;
    public error: string | null = null;

    constructor(initialState: Partial<RootStore> = {}) {
        // Инициализация через DI
        this.authStore = DIContainer.get(AuthStore);
        this.userStore = DIContainer.get(UserStore);
        this.notificationStore = DIContainer.get(NotificationStore);
        this.performanceStore = DIContainer.get(PerformanceStore);

        // Применение начального состояния
        Object.assign(this, initialState);

        // Включение реактивности MobX
        makeAutoObservable(this, {
            initialize: false,
            reset: false
        });
    }

    // Глобальная инициализация приложения
    async initialize() {
        try {
            runInAction(() => {
                this.isLoading = true;
                this.error = null;
            });

            // Параллельная инициализация субсторов
            await Promise.all([
                this.authStore.initialize?.(),
                this.userStore.initialize?.(),
                this.notificationStore.initialize?.(),
                this.performanceStore.initialize?.()
            ]);

            runInAction(() => {
                this.isInitialized = true;
                this.isLoading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.error = error instanceof Error ? error.message : 'Ошибка инициализации';
                this.isLoading = false;
            });

            // Логирование критической ошибки
            console.error('Ошибка инициализации RootStore:', error);
        }
    }

    // Сброс состояния всех субсторов
    reset() {
        runInAction(() => {
            this.authStore.reset?.();
            this.userStore.reset?.();
            this.notificationStore.reset?.();
            this.performanceStore.reset?.();

            this.isInitialized = false;
            this.isLoading = false;
            this.error = null;
        });
    }

    // Глобальные утилиты
    get isReady(): boolean {
        return this.isInitialized && !this.isLoading && !this.error;
    }

    // Централизованная обработка ошибок
    handleGlobalError(error: Error) {
        runInAction(() => {
            this.error = error.message;
        });

        // Логирование и уведомление
        console.error('Глобальная ошибка:', error);
        this.notificationStore.showError(error.message);
    }
}

export default RootStore;
