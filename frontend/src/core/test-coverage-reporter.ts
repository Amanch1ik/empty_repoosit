import { makeAutoObservable } from 'mobx';
import SentryService from '@/services/sentry.service';
import { LOG_CONFIG } from '@/config';

// Типы тестов
enum TestType {
    UNIT = 'unit',
    INTEGRATION = 'integration',
    E2E = 'e2e',
    PERFORMANCE = 'performance'
}

// Статус теста
enum TestStatus {
    PASSED = 'passed',
    FAILED = 'failed',
    SKIPPED = 'skipped'
}

// Результат теста
interface TestResult {
    name: string;
    type: TestType;
    status: TestStatus;
    duration: number;
    error?: Error;
}

// Метрики покрытия
interface CoverageMetrics {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    coveragePercentage: number;
}

// Конфигурация репортера
interface ReporterConfig {
    minCoverageThreshold: number;
    reportToSentry: boolean;
    saveReportLocally: boolean;
}

class TestCoverageReporter {
    // История результатов тестов
    private _testResults: Record<TestType, TestResult[]> = {
        [TestType.UNIT]: [],
        [TestType.INTEGRATION]: [],
        [TestType.E2E]: [],
        [TestType.PERFORMANCE]: []
    };

    // Метрики покрытия
    private _coverageMetrics: Record<TestType, CoverageMetrics> = {
        [TestType.UNIT]: this.createEmptyCoverageMetrics(),
        [TestType.INTEGRATION]: this.createEmptyCoverageMetrics(),
        [TestType.E2E]: this.createEmptyCoverageMetrics(),
        [TestType.PERFORMANCE]: this.createEmptyCoverageMetrics()
    };

    // Конфигурация репортера
    private _config: ReporterConfig = {
        minCoverageThreshold: 80,
        reportToSentry: LOG_CONFIG.ERROR_TRACKING.SEND_TO_SERVER,
        saveReportLocally: true
    };

    constructor() {
        makeAutoObservable(this);
    }

    // Создание пустых метрик покрытия
    private createEmptyCoverageMetrics(): CoverageMetrics {
        return {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            coveragePercentage: 0
        };
    }

    // Регистрация результата теста
    public registerTestResult(result: TestResult) {
        // Добавление результата в историю
        this._testResults[result.type].push(result);

        // Обновление метрик
        const metrics = this._coverageMetrics[result.type];
        metrics.totalTests++;

        switch (result.status) {
            case TestStatus.PASSED:
                metrics.passedTests++;
                break;
            case TestStatus.FAILED:
                metrics.failedTests++;
                
                // Логирование ошибок в Sentry
                if (result.error && this._config.reportToSentry) {
                    SentryService.captureException(result.error, {
                        tags: { 
                            testType: result.type,
                            testName: result.name
                        }
                    });
                }
                break;
            case TestStatus.SKIPPED:
                metrics.skippedTests++;
                break;
        }

        // Пересчет процента покрытия
        metrics.coveragePercentage = 
            (metrics.passedTests / metrics.totalTests) * 100;
    }

    // Получение метрик покрытия
    public getCoverageMetrics(type?: TestType): 
        CoverageMetrics | Record<TestType, CoverageMetrics> 
    {
        return type ? this._coverageMetrics[type] : this._coverageMetrics;
    }

    // Проверка достаточности покрытия
    public isAdequateCoverage(
        type: TestType, 
        threshold?: number
    ): boolean {
        const metrics = this._coverageMetrics[type];
        const effectiveThreshold = threshold || this._config.minCoverageThreshold;
        
        return metrics.coveragePercentage >= effectiveThreshold;
    }

    // Генерация отчета о покрытии
    public generateCoverageReport(): string {
        const report: string[] = ['Test Coverage Report'];

        Object.entries(this._coverageMetrics).forEach(([type, metrics]) => {
            report.push(`
${type.toUpperCase()} Tests:
- Total Tests: ${metrics.totalTests}
- Passed: ${metrics.passedTests}
- Failed: ${metrics.failedTests}
- Skipped: ${metrics.skippedTests}
- Coverage: ${metrics.coveragePercentage.toFixed(2)}%
            `);
        });

        // Сохранение отчета локально
        if (this._config.saveReportLocally) {
            this.saveReportLocally(report.join('\n'));
        }

        return report.join('\n');
    }

    // Сохранение отчета локально
    private saveReportLocally(report: string) {
        try {
            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `test_coverage_${new Date().toISOString()}.txt`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Не удалось сохранить отчет', error);
        }
    }

    // Получение результатов тестов
    public getTestResults(type?: TestType): 
        TestResult[] | Record<TestType, TestResult[]> 
    {
        return type ? this._testResults[type] : this._testResults;
    }

    // Очистка истории тестов
    public resetCoverage() {
        Object.values(TestType).forEach(type => {
            this._testResults[type] = [];
            this._coverageMetrics[type] = this.createEmptyCoverageMetrics();
        });
    }

    // Настройка конфигурации репортера
    public setReporterConfig(config: Partial<ReporterConfig>) {
        this._config = { ...this._config, ...config };
    }
}

export default new TestCoverageReporter();
