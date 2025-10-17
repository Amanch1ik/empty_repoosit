import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { RootStore } from '@/stores/root.store';

// Типы для моков
type MockFunction = (...args: any[]) => any;
type MockObject = Record<string, MockFunction>;

class TestUtils {
    // Создание моков
    static createMock<T extends MockObject>(mockImplementation: Partial<T> = {}): jest.Mocked<T> {
        return jest.fn(() => mockImplementation) as jest.Mocked<T>;
    }

    // Рендеринг компонента с провайдерами
    static renderWithProviders(
        ui: ReactElement, 
        options: {
            route?: string;
            initialState?: Partial<RootStore>;
            stores?: Record<string, any>;
        } = {}
    ) {
        const {
            route = '/',
            initialState = {},
            stores = {}
        } = options;

        // Создание тестового стора
        const testStores = {
            rootStore: new RootStore(initialState),
            ...stores
        };

        return render(
            <Provider {...testStores}>
                <MemoryRouter initialEntries={[route]}>
                    {ui}
                </MemoryRouter>
            </Provider>
        );
    }

    // Создание асинхронного теста
    static asyncTest(fn: () => Promise<void>) {
        return async () => {
            try {
                await fn();
            } catch (error) {
                console.error('Async test failed:', error);
                throw error;
            }
        };
    }

    // Генерация тестовых данных
    static generateTestData<T>(
        template: Partial<T>, 
        overrides: Partial<T> = {}
    ): T {
        return { ...template, ...overrides } as T;
    }

    // Симуляция задержки
    static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Перехват консольных ошибок
    static captureConsoleErrors(callback: () => void): string[] {
        const errors: string[] = [];
        const originalConsoleError = console.error;

        console.error = (message: string) => {
            errors.push(message);
        };

        try {
            callback();
        } finally {
            console.error = originalConsoleError;
        }

        return errors;
    }

    // Проверка на выброс исключения
    static expectToThrow(
        fn: () => void, 
        errorMessage?: string | RegExp
    ) {
        try {
            fn();
            throw new Error('Expected function to throw an error');
        } catch (error) {
            if (errorMessage) {
                expect(error.message).toMatch(errorMessage);
            }
        }
    }

    // Создание шпиона с возвратом результата
    static createSpy<T>(
        returnValue: T, 
        implementation?: (...args: any[]) => T
    ): jest.Mock {
        const spy = jest.fn();
        
        if (implementation) {
            spy.mockImplementation(implementation);
        } else {
            spy.mockReturnValue(returnValue);
        }

        return spy;
    }
}

export default TestUtils;
