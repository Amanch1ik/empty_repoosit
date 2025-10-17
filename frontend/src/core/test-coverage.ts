import { makeAutoObservable } from 'mobx';
import { LOG_CONFIG } from '@/config';
import SentryService from '@/services/sentry.service';

// Типы покрытия
enum CoverageType {
    UNIT = 'unit',
    INTEGRATION = 'integration',
    E2E = 'e2e'
}

// Метрики покрытия
interface CoverageMetric {
    type: CoverageType;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    coveragePercentage: number;
}

// Результат теста
interface TestResult {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: Error;
}

class TestCoverageService {
    // История результатов тестов
    private _testResults: Record<CoverageType, TestResult[]> = {
        [CoverageType.UNIT]: [],
        [CoverageType.INTEGRATION]: [],
        [CoverageType.E2E]: []
    };

    // Метрики покрытия
    private _coverageMetrics: Record<CoverageType, CoverageMetric> = {
        [CoverageType.UNIT]: this.createEmptyCoverageMetric(CoverageType.UNIT),
        [CoverageType.INTEGRATION]: this.createEmptyCoverageMetric(CoverageType.INTEGRATION),
        [CoverageType.E2E]: this.createEmptyCoverageMetric(CoverageType.E2E)
    };

    constructor() {
        makeAutoObservable(this);
    }

    // Создание пустой метрики покрытия
    private createEmptyCoverageMetric(type: CoverageType): CoverageMetric {
        return {
            type,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            coveragePercentage: 0
        };
    }

    // Регистрация результата теста
    public registerTestResult(
        type: CoverageType, 
        result: TestResult
    ) {
        // Добавление результата
        this._testResults[type].push(result);

        // Обновление метрик
        const metric = this._coverageMetrics[type];
        metric.totalTests++;

        switch (result.status) {
            case 'passed':
                metric.passedTests++;
                break;
            case 'failed':
                metric.failedTests++;
                
                // Логирование ошибок в Sentry
                if (result.error) {
                    SentryService.captureException(result.error, {
                        tags: { 
                            testType: type,
                            testName: result.name
                        }
                    });
                }
                break;
            case 'skipped':
                metric.skippedTests++;
                break;
        }

        // Пересчет процента покрытия
        metric.coveragePercentage = 
            (metric.passedTests / metric.totalTests) * 100;
    }

    // Получение метрик покрытия
    public getCoverageMetrics(type?: CoverageType): CoverageMetric | Record<CoverageType, CoverageMetric> {
        return type ? this._coverageMetrics[type] : this._coverageMetrics;
    }

    // Получение результатов тестов
    public getTestResults(type?: CoverageType): TestResult[] | Record<CoverageType, TestResult[]> {
        return type ? this._testResults[type] : this._testResults;
    }

    // Проверка общего покрытия
    public isAdequateCoverage(type: CoverageType, threshold: number = 80): boolean {
        const metric = this._coverageMetrics[type];
        return metric.coveragePercentage >= threshold;
    }

    // Генерация отчета о покрытии
    public generateCoverageReport(): string {
        const report: string[] = ['Test Coverage Report'];

        Object.values(CoverageType).forEach(type => {
            const metric = this._coverageMetrics[type];
            report.push(`
${type.toUpperCase()} Tests:
- Total: ${metric.totalTests}
- Passed: ${metric.passedTests}
- Failed: ${metric.failedTests}
- Skipped: ${metric.skippedTests}
- Coverage: ${metric.coveragePercentage.toFixed(2)}%
            `);
        });

        return report.join('\n');
    }

    // Сброс статистики
    public resetCoverage() {
        Object.values(CoverageType).forEach(type => {
            this._testResults[type] = [];
            this._coverageMetrics[type] = this.createEmptyCoverageMetric(type);
        });
    }
}

export default new TestCoverageService();
