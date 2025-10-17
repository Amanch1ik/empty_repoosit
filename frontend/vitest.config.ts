import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov', 'clover'],
            reportsDirectory: './coverage',
            // Повышаем требования к покрытию
            thresholds: {
                lines: 90,
                branches: 85,
                functions: 90,
                statements: 90
            },
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/src/main.tsx',
                '**/src/test/**',
                '**/*.d.ts',
                '**/src/routes/**',
                '**/src/store/**',
                '**/src/types/**'
            ]
        },
        // Группировка и параллельный запуск тестов
        testNamePattern: '(Unit|Integration|Performance|Accessibility)',
        maxThreads: 4,
        minThreads: 2,
        // Настройки для различных типов тестов
        include: [
            'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
            'src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'
        ],
        // Настройки для моков и симуляций
        mockReset: true,
        restoreMocks: true,
        clearMocks: true,
        // Таймауты и дополнительные настройки
        testTimeout: 10000,
        hookTimeout: 5000,
        // Подробный вывод
        reporters: ['verbose', 'html'],
        // Автоматический запуск при изменениях
        watch: process.env.NODE_ENV === 'development'
    }
});
