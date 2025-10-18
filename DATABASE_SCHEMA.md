# 🗄️ Архитектура базы данных Bonus APP

## 📊 Схема связей таблиц

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │     ROLES       │    │   USER_ROLES    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───┤ id (PK)         │◄───┤ user_id (FK)    │
│ name            │    │ name            │    │ role_id (FK)    │
│ email           │    │ description     │    │ assigned_at     │
│ phone           │    │ permissions     │    └─────────────────┘
│ password_hash   │    │ created_at      │
│ avatar_url      │    └─────────────────┘
│ bio             │
│ address         │
│ phone_verified  │
│ email_verified  │
│ city_id (FK)    │
│ referral_code   │
│ referred_by (FK)│
│ is_active       │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│    WALLETS      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ balance         │
│ currency        │
│ daily_limit     │
│ monthly_limit   │
│ single_transaction_limit│
│ daily_used      │
│ monthly_used    │
│ last_daily_reset│
│ last_monthly_reset│
│ is_active       │
│ is_frozen       │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│  TRANSACTIONS   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ amount          │
│ commission      │
│ total_amount    │
│ payment_method  │
│ status          │
│ created_at      │
│ processed_at    │
│ updated_at      │
│ gateway_transaction_id│
│ gateway_response │
│ error_message   │
│ phone_number    │
│ card_last_four  │
│ ip_address      │
│ user_agent      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    REFUNDS      │
├─────────────────┤
│ id (PK)         │
│ transaction_id (FK)│
│ user_id (FK)    │
│ amount          │
│ reason          │
│ status          │
│ created_at      │
│ processed_at    │
│ admin_notes     │
│ gateway_refund_id│
└─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     CITIES      │    │    PARTNERS    │    │PARTNER_LOCATIONS│
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │◄───┤ id (PK)         │◄───┤ id (PK)         │
│ name            │    │ name            │    │ partner_id (FK) │
│ name_ky         │    │ description     │    │ name            │
│ name_en         │    │ logo_url        │    │ address         │
│ latitude        │    │ website_url     │    │ latitude        │
│ longitude       │    │ phone           │    │ longitude       │
│ is_active       │    │ email           │    │ phone           │
│ created_at      │    │ category        │    │ working_hours   │
└─────────────────┘    │ city_id (FK)    │    │ is_active       │
         │              │ latitude        │    │ created_at      │
         │              │ longitude       │    └─────────────────┘
         │              │ is_active       │
         │              │ created_at      │
         │              │ updated_at      │
         │              └─────────────────┘
         │                       │
         │                       │ 1:N
         │                       ▼
         │              ┌─────────────────┐
         │              │     ORDERS      │
         │              ├─────────────────┤
         │              │ id (PK)         │
         │              │ user_id (FK)    │
         │              │ partner_id (FK) │
         │              │ partner_location_id (FK)│
         │              │ amount          │
         │              │ bonus_amount    │
         │              │ status          │
         │              │ payment_method  │
         │              │ notes           │
         │              │ created_at      │
         │              │ updated_at      │
         │              └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     AGENTS      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ agent_code      │
│ commission_rate │
│ total_earnings  │
│ is_active       │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│   REFERRALS     │
├─────────────────┤
│ id (PK)         │
│ referrer_user_id (FK)│
│ referred_user_id (FK)│
│ bonus_amount    │
│ status          │
│ created_at      │
│ processed_at    │
└─────────────────┘

┌─────────────────┐
│PAYMENT_METHODS  │
├─────────────────┤
│ id (PK)         │
│ code            │
│ name            │
│ name_ky         │
│ name_en         │
│ commission_rate │
│ min_commission  │
│ max_commission  │
│ min_amount      │
│ max_amount      │
│ is_active       │
│ is_instant      │
│ processing_time_minutes│
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│PAYMENT_ANALYTICS│
├─────────────────┤
│ id (PK)         │
│ date            │
│ bank_card_count │
│ bank_card_amount│
│ elsom_count     │
│ elsom_amount    │
│ mobile_balance_count│
│ mobile_balance_amount│
│ elkart_count    │
│ elkart_amount   │
│ cash_terminal_count│
│ cash_terminal_amount│
│ bank_transfer_count│
│ bank_transfer_amount│
│ total_transactions│
│ total_amount    │
│ total_commission│
│ successful_transactions│
│ failed_transactions│
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## 🔄 Типы запросов и их выполнение

### 1. Простые SELECT запросы
```sql
-- Получение пользователя по ID
SELECT * FROM users WHERE id = 123;

-- Получение активных пользователей
SELECT * FROM users WHERE is_active = true;

-- Получение пользователей по городу
SELECT * FROM users WHERE city_id = 1 AND is_active = true;
```

### 2. Запросы с JOIN
```sql
-- Пользователь с кошельком
SELECT u.*, w.balance, w.currency 
FROM users u 
JOIN wallets w ON u.id = w.user_id 
WHERE u.id = 123;

-- Транзакции с данными пользователя
SELECT t.*, u.name, u.phone 
FROM transactions t 
JOIN users u ON t.user_id = u.id 
WHERE t.user_id = 123;
```

### 3. Агрегатные запросы
```sql
-- Статистика платежей пользователя
SELECT 
    COUNT(*) as total_transactions,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    MAX(amount) as max_amount,
    MIN(amount) as min_amount
FROM transactions 
WHERE user_id = 123 AND status = 'success';

-- Статистика по методам оплаты
SELECT 
    payment_method,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount
FROM transactions 
WHERE status = 'success'
GROUP BY payment_method
ORDER BY total_amount DESC;
```

### 4. Запросы с подзапросами
```sql
-- Пользователи с платежами выше 1000 сом
SELECT * FROM users 
WHERE id IN (
    SELECT user_id 
    FROM transactions 
    WHERE amount >= 1000 AND status = 'success'
);

-- Пользователи без платежей за последние 30 дней
SELECT * FROM users 
WHERE id NOT IN (
    SELECT DISTINCT user_id 
    FROM transactions 
    WHERE created_at >= NOW() - INTERVAL '30 days'
);
```

### 5. Запросы с пагинацией
```sql
-- Транзакции с пагинацией
SELECT * FROM transactions 
WHERE user_id = 123 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;

-- Подсчет общего количества для пагинации
SELECT COUNT(*) FROM transactions WHERE user_id = 123;
```

## 🚀 Оптимизация запросов

### Индексы для быстрого поиска
```sql
-- Основные индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_city_id ON users(city_id);

-- Индексы для транзакций
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);

-- Составные индексы
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_transactions_status_date ON transactions(status, created_at);

-- Индексы для кошельков
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);

-- Индексы для заказов
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_partner_id ON orders(partner_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### Партиционирование больших таблиц
```sql
-- Партиционирование транзакций по месяцам
CREATE TABLE transactions_2024_01 PARTITION OF transactions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE transactions_2024_02 PARTITION OF transactions
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Автоматическое создание партиций
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';
    
    EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

## 🔒 Безопасность запросов

### Защита от SQL инъекций
```python
# ❌ НЕПРАВИЛЬНО - уязвимо для SQL инъекций
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ ПРАВИЛЬНО - SQLAlchemy защищает автоматически
user = db.query(User).filter(User.email == email).first()

# ✅ ПРАВИЛЬНО - параметризованные запросы
result = db.execute(
    text("SELECT * FROM users WHERE email = :email"),
    {"email": email}
)
```

### Шифрование чувствительных данных
```python
from cryptography.fernet import Fernet

class User(Base):
    # Пароли всегда хэшируются
    password_hash = Column(String(255))
    
    # Чувствительные данные шифруются
    def set_phone(self, phone: str):
        self.phone = encrypt_data(phone)
    
    def get_phone(self) -> str:
        return decrypt_data(self.phone)
```

## 📊 Мониторинг производительности

### Отслеживание медленных запросов
```python
import time
import logging
from sqlalchemy import event
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(Engine, "after_cursor_execute")
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    if total > 1.0:  # Запросы дольше 1 секунды
        logger.warning(f"Медленный запрос: {total:.2f}s - {statement}")
```

### Статистика использования БД
```python
def get_database_stats(db: Session) -> dict:
    """Получение статистики использования БД"""
    
    # Размер таблиц
    table_sizes = db.execute(text("""
        SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    """)).fetchall()
    
    # Активные соединения
    active_connections = db.execute(text("""
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
    """)).scalar()
    
    # Статистика по таблицам
    table_stats = db.execute(text("""
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes
        FROM pg_stat_user_tables
        ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
    """)).fetchall()
    
    return {
        "table_sizes": [dict(row) for row in table_sizes],
        "active_connections": active_connections,
        "table_stats": [dict(row) for row in table_stats]
    }
```

## 🎯 Заключение

**База данных Bonus APP построена с учетом:**

✅ **Производительности** - индексы, кэширование, пулы соединений  
✅ **Безопасности** - защита от SQL инъекций, шифрование данных  
✅ **Масштабируемости** - горизонтальное масштабирование, партиционирование  
✅ **Надежности** - транзакции, резервное копирование, мониторинг  
✅ **Гибкости** - миграции, версионирование схемы  

**Система готова обрабатывать миллионы транзакций!** 🚀
