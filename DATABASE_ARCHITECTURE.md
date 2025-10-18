# 🗄️ Архитектура базы данных Bonus APP

## 📊 Структура таблиц

### 👥 Пользователи и аутентификация
```sql
-- Основная таблица пользователей
users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    avatar_url VARCHAR(500),
    bio TEXT,
    address VARCHAR(500),
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    verification_expires_at TIMESTAMP,
    device_tokens JSON DEFAULT '[]',
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    city_id INTEGER REFERENCES cities(id),
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    referral_code VARCHAR(50) UNIQUE,
    referred_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Роли пользователей
roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Связь пользователей и ролей
user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);
```

### 💰 Платежная система
```sql
-- Кошельки пользователей
wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    balance DECIMAL(15,2) DEFAULT 0.0,
    currency VARCHAR(3) DEFAULT 'KGS',
    daily_limit DECIMAL(15,2) DEFAULT 50000.0,
    monthly_limit DECIMAL(15,2) DEFAULT 500000.0,
    single_transaction_limit DECIMAL(15,2) DEFAULT 100000.0,
    daily_used DECIMAL(15,2) DEFAULT 0.0,
    monthly_used DECIMAL(15,2) DEFAULT 0.0,
    last_daily_reset TIMESTAMP DEFAULT NOW(),
    last_monthly_reset TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Транзакции
transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    commission DECIMAL(15,2) DEFAULT 0.0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method payment_method_enum NOT NULL,
    status payment_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    updated_at TIMESTAMP,
    gateway_transaction_id VARCHAR(255),
    gateway_response TEXT,
    error_message TEXT,
    phone_number VARCHAR(20),
    card_last_four VARCHAR(4),
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Возвраты средств
refunds (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT NOT NULL,
    status payment_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    admin_notes TEXT,
    gateway_refund_id VARCHAR(255)
);

-- Методы оплаты
payment_methods (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_ky VARCHAR(100),
    name_en VARCHAR(100),
    commission_rate DECIMAL(5,4) NOT NULL,
    min_commission DECIMAL(15,2) DEFAULT 0.0,
    max_commission DECIMAL(15,2),
    min_amount DECIMAL(15,2) DEFAULT 10.0,
    max_amount DECIMAL(15,2) DEFAULT 100000.0,
    is_active BOOLEAN DEFAULT TRUE,
    is_instant BOOLEAN DEFAULT FALSE,
    processing_time_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Аналитика платежей
payment_analytics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    bank_card_count INTEGER DEFAULT 0,
    bank_card_amount DECIMAL(15,2) DEFAULT 0.0,
    elsom_count INTEGER DEFAULT 0,
    elsom_amount DECIMAL(15,2) DEFAULT 0.0,
    mobile_balance_count INTEGER DEFAULT 0,
    mobile_balance_amount DECIMAL(15,2) DEFAULT 0.0,
    elkart_count INTEGER DEFAULT 0,
    elkart_amount DECIMAL(15,2) DEFAULT 0.0,
    cash_terminal_count INTEGER DEFAULT 0,
    cash_terminal_amount DECIMAL(15,2) DEFAULT 0.0,
    bank_transfer_count INTEGER DEFAULT 0,
    bank_transfer_amount DECIMAL(15,2) DEFAULT 0.0,
    total_transactions INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0.0,
    total_commission DECIMAL(15,2) DEFAULT 0.0,
    successful_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🏪 Партнеры и заказы
```sql
-- Города
cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ky VARCHAR(100),
    name_en VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Партнеры
partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    category VARCHAR(100),
    city_id INTEGER REFERENCES cities(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Локации партнеров
partner_locations (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(50),
    working_hours JSON DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Заказы
orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    partner_id INTEGER REFERENCES partners(id),
    partner_location_id INTEGER REFERENCES partner_locations(id),
    amount DECIMAL(15,2) NOT NULL,
    bonus_amount DECIMAL(15,2) DEFAULT 0.0,
    status order_status_enum DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🎯 Агенты и рефералы
```sql
-- Агенты
agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    agent_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    total_earnings DECIMAL(15,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Рефералы
referrals (
    id SERIAL PRIMARY KEY,
    referrer_user_id INTEGER REFERENCES users(id),
    referred_user_id INTEGER REFERENCES users(id),
    bonus_amount DECIMAL(15,2) DEFAULT 0.0,
    status referral_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Бонусы агентов от партнеров
agent_partner_bonuses (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id),
    partner_id INTEGER REFERENCES partners(id),
    bonus_amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Как работают запросы к БД

### 1. Подключение к БД
```python
# yess-backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Создание движка БД
engine = create_engine(
    "postgresql://user:password@localhost:5432/bonus_app",
    pool_pre_ping=True,      # Проверка соединения
    pool_size=10,            # Размер пула соединений
    max_overflow=20          # Максимум дополнительных соединений
)

# Создание фабрики сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()
```

### 2. Dependency Injection для сессий
```python
def get_db():
    """Dependency для получения сессии БД"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Автоматическое закрытие сессии
```

### 3. Примеры запросов

#### Создание пользователя
```python
# POST /api/v1/users/register
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Проверка существования
    existing_user = db.query(User).filter(
        or_(User.email == user_data.email, User.phone == user_data.phone)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    
    # 2. Создание пользователя
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password)
    )
    
    db.add(user)
    db.commit()      # Сохранение в БД
    db.refresh(user) # Обновление объекта из БД
    
    return user
```

#### Пополнение кошелька
```python
# POST /api/v1/payments/replenish
async def replenish_wallet(
    payment_request: PaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Создание транзакции
    transaction = Transaction(
        user_id=current_user.id,
        amount=payment_request.amount,
        commission=calculate_commission(payment_request.amount),
        payment_method=payment_request.method,
        status='pending'
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    # 2. Обновление баланса кошелька
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
    
    wallet.balance += payment_request.amount
    db.commit()
    
    return {"status": "success", "new_balance": wallet.balance}
```

#### Получение истории транзакций с пагинацией
```python
# GET /api/v1/payments/transactions?page=1&page_size=20
async def get_transaction_history(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Подсчет общего количества
    total_count = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).count()
    
    # 2. Получение транзакций с пагинацией
    offset = (page - 1) * page_size
    transactions = db.query(Transaction)\
        .filter(Transaction.user_id == current_user.id)\
        .order_by(Transaction.created_at.desc())\
        .offset(offset)\
        .limit(page_size)\
        .all()
    
    return {
        "transactions": transactions,
        "total_count": total_count,
        "page": page,
        "page_size": page_size
    }
```

#### Сложный запрос с JOIN
```python
# GET /api/v1/partners/{partner_id}/orders
async def get_partner_orders(
    partner_id: int,
    db: Session = Depends(get_db)
):
    # Запрос с JOIN нескольких таблиц
    orders = db.query(Order)\
        .join(User, Order.user_id == User.id)\
        .join(Partner, Order.partner_id == Partner.id)\
        .join(PartnerLocation, Order.partner_location_id == PartnerLocation.id)\
        .filter(Order.partner_id == partner_id)\
        .order_by(Order.created_at.desc())\
        .all()
    
    return orders
```

#### Агрегатные запросы
```python
# GET /api/v1/payments/analytics
async def get_payment_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Статистика пользователя
    stats = db.query(
        func.count(Transaction.id).label('total_transactions'),
        func.sum(Transaction.amount).label('total_amount'),
        func.avg(Transaction.amount).label('average_amount')
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.status == 'success'
    ).first()
    
    # Статистика по методам оплаты
    methods_stats = db.query(
        Transaction.payment_method,
        func.count(Transaction.id).label('count'),
        func.sum(Transaction.amount).label('amount')
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.status == 'success'
    ).group_by(Transaction.payment_method).all()
    
    return {
        "total_transactions": stats.total_transactions,
        "total_amount": float(stats.total_amount or 0),
        "average_amount": float(stats.average_amount or 0),
        "methods_stats": [
            {
                "method": stat.payment_method,
                "count": stat.count,
                "amount": float(stat.amount or 0)
            }
            for stat in methods_stats
        ]
    }
```

## 🔧 Оптимизация запросов

### Индексы для быстрого поиска
```sql
-- Индексы для пользователей
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Индексы для транзакций
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);

-- Составные индексы
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
```

### Кэширование
```python
# Использование Redis для кэширования
from app.core.cache import cache

@cache.cached(timeout=300)  # Кэш на 5 минут
async def get_payment_methods():
    return db.query(PaymentMethod).filter(PaymentMethod.is_active == True).all()

@cache.cached(timeout=60)   # Кэш на 1 минуту
async def get_user_balance(user_id: int):
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    return wallet.balance if wallet else 0.0
```

## 🚀 Производительность

### Connection Pooling
```python
# Настройка пула соединений
engine = create_engine(
    DATABASE_URL,
    pool_size=20,        # 20 постоянных соединений
    max_overflow=30,     # До 30 дополнительных
    pool_pre_ping=True,  # Проверка соединений
    pool_recycle=3600    # Переподключение каждый час
)
```

### Асинхронные запросы
```python
# Использование async/await для неблокирующих запросов
async def get_user_transactions_async(user_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
        )
        return result.scalars().all()
```

## 📊 Мониторинг БД

### Логирование запросов
```python
import logging

# Настройка логирования SQL запросов
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Отслеживание медленных запросов
@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(Engine, "after_cursor_execute")
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    if total > 1.0:  # Запросы дольше 1 секунды
        logger.warning(f"Медленный запрос: {total:.2f}s - {statement}")
```

## 🔒 Безопасность БД

### Защита от SQL инъекций
```python
# SQLAlchemy автоматически защищает от SQL инъекций
# ❌ НЕПРАВИЛЬНО (уязвимо)
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ ПРАВИЛЬНО (безопасно)
user = db.query(User).filter(User.email == email).first()
```

### Шифрование чувствительных данных
```python
from cryptography.fernet import Fernet

class User(Base):
    # Пароли хэшируются
    password_hash = Column(String(255))
    
    # Чувствительные данные шифруются
    def set_phone(self, phone: str):
        self.phone = encrypt_data(phone)
    
    def get_phone(self) -> str:
        return decrypt_data(self.phone)
```

## 📈 Масштабирование

### Горизонтальное масштабирование
```python
# Read Replicas для чтения
read_engine = create_engine(READ_DATABASE_URL)
write_engine = create_engine(WRITE_DATABASE_URL)

# Разделение операций чтения и записи
class DatabaseRouter:
    def get_read_session(self):
        return SessionLocal(bind=read_engine)
    
    def get_write_session(self):
        return SessionLocal(bind=write_engine)
```

### Партиционирование таблиц
```sql
-- Партиционирование транзакций по дате
CREATE TABLE transactions_2024_01 PARTITION OF transactions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE transactions_2024_02 PARTITION OF transactions
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## 🎯 Заключение

**База данных Bonus APP построена с учетом:**

✅ **Производительности** - индексы, кэширование, пулы соединений  
✅ **Безопасности** - защита от SQL инъекций, шифрование данных  
✅ **Масштабируемости** - горизонтальное масштабирование, партиционирование  
✅ **Надежности** - транзакции, резервное копирование, мониторинг  
✅ **Гибкости** - миграции, версионирование схемы  

**Система готова обрабатывать миллионы транзакций!** 🚀
