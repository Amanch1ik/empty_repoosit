import { makeAutoObservable } from 'mobx';
import { SECURITY_CONFIG } from '@/config';
import SentryService from './sentry.service';
import TokenManagementService from './token-management.service';

// Типы угроз безопасности
enum SecurityThreatType {
    XSS = 'xss',
    CSRF = 'csrf',
    INJECTION = 'injection',
    UNAUTHORIZED_ACCESS = 'unauthorized_access',
    BRUTE_FORCE = 'brute_force'
}

// Политика безопасности
interface SecurityPolicy {
    maxLoginAttempts: number;
    loginBlockDuration: number;
    requiredPasswordStrength: number;
}

// Журнал безопасности
interface SecurityLogEntry {
    type: SecurityThreatType;
    timestamp: number;
    details: any;
}

class SecurityGuardService {
    // Политика безопасности
    private _securityPolicy: SecurityPolicy = {
        maxLoginAttempts: SECURITY_CONFIG.SECURITY_POLICY.MAX_LOGIN_ATTEMPTS,
        loginBlockDuration: SECURITY_CONFIG.SECURITY_POLICY.LOGIN_BLOCK_DURATION,
        requiredPasswordStrength: 3 // Уровень сложности пароля
    };

    // Журнал безопасности
    private _securityLog: SecurityLogEntry[] = [];

    // Счетчик неудачных попыток входа
    private _loginAttempts: Record<string, { count: number, lastAttempt: number }> = {};

    constructor() {
        makeAutoObservable(this);
    }

    // Проверка сложности пароля
    public validatePasswordStrength(password: string): number {
        let strength = 0;
        const checks = [
            password.length >= 8,           // Длина
            /[A-Z]/.test(password),         // Заглавные буквы
            /[a-z]/.test(password),         // Строчные буквы
            /[0-9]/.test(password),         // Цифры
            /[^A-Za-z0-9]/.test(password)   // Спецсимволы
        ];

        checks.forEach(check => {
            if (check) strength++;
        });

        return strength;
    }

    // Защита от брутфорса
    public trackLoginAttempt(username: string): boolean {
        const now = Date.now();
        const attempts = this._loginAttempts[username] || { count: 0, lastAttempt: 0 };

        // Сброс счетчика после истечения блокировки
        if (now - attempts.lastAttempt > this._securityPolicy.loginBlockDuration) {
            attempts.count = 0;
        }

        attempts.count++;
        attempts.lastAttempt = now;

        this._loginAttempts[username] = attempts;

        // Блокировка при превышении лимита
        if (attempts.count > this._securityPolicy.maxLoginAttempts) {
            this.logSecurityThreat({
                type: SecurityThreatType.BRUTE_FORCE,
                timestamp: now,
                details: { username }
            });
            return false;
        }

        return true;
    }

    // Защита от XSS
    public sanitizeInput(input: string): string {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Защита от CSRF
    public generateCSRFToken(): string {
        return crypto.randomUUID();
    }

    // Проверка CSRF токена
    public validateCSRFToken(token: string): boolean {
        // Реализация проверки токена
        return token.length === 36; // UUID
    }

    // Логирование угроз безопасности
    private logSecurityThreat(threat: SecurityLogEntry) {
        this._securityLog.push(threat);

        // Отправка критических угроз в Sentry
        SentryService.captureMessage(
            `Угроза безопасности: ${threat.type}`, 
            'error'
        );

        // Ограничение размера журнала
        if (this._securityLog.length > 50) {
            this._securityLog.shift();
        }
    }

    // Проверка авторизации
    public checkAuthorization(requiredRoles?: string[]): boolean {
        const token = TokenManagementService.accessToken;
        
        if (!token) {
            this.logSecurityThreat({
                type: SecurityThreatType.UNAUTHORIZED_ACCESS,
                timestamp: Date.now(),
                details: { message: 'Отсутствует токен' }
            });
            return false;
        }

        // Проверка ролей, если указаны
        if (requiredRoles) {
            const userRoles = TokenManagementService.getUserRoles();
            const hasRequiredRole = requiredRoles.some(role => 
                userRoles.includes(role)
            );

            if (!hasRequiredRole) {
                this.logSecurityThreat({
                    type: SecurityThreatType.UNAUTHORIZED_ACCESS,
                    timestamp: Date.now(),
                    details: { 
                        message: 'Недостаточно прав',
                        requiredRoles,
                        userRoles
                    }
                });
                return false;
            }
        }

        return true;
    }

    // Получение журнала безопасности
    get securityLog(): SecurityLogEntry[] {
        return this._securityLog;
    }

    // Очистка журнала безопасности
    public clearSecurityLog() {
        this._securityLog = [];
    }
}

export default new SecurityGuardService();
