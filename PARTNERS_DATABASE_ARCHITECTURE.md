# 🏪 Архитектура хранения данных партнеров в Bonus APP

## 🗄️ Структура базы данных

### 📊 Одна БД для всего приложения

**ДА, у нас ОДНА база данных PostgreSQL для всего приложения!** Это называется **монолитная архитектура БД**.

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                      │
│                     "bonus_app_db"                          │
├─────────────────────────────────────────────────────────────┤
│  👥 users          │  💰 wallets        │  💳 transactions  │
│  🏪 partners       │  📍 cities         │  📦 orders        │
│  🎯 agents         │  🔄 referrals      │  📊 analytics     │
│  🏢 locations      │  👨‍💼 employees     │  🎁 promotions    │
└─────────────────────────────────────────────────────────────┘
```

## 🏪 Данные партнеров - где хранятся

### 📋 Основные таблицы партнеров

```sql
-- Основная таблица партнеров
partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- Название партнера
    description TEXT,                     -- Описание
    category VARCHAR(100),                -- Категория (ресторан, магазин, etc.)
    city_id INTEGER REFERENCES cities(id), -- Город
    logo_url VARCHAR(500),               -- Логотип
    cover_image_url VARCHAR(500),        -- Обложка
    qr_code_url VARCHAR(500),            -- QR код для оплаты
    phone VARCHAR(50),                   -- Телефон
    email VARCHAR(255),                  -- Email
    website VARCHAR(500),                -- Сайт
    social_media JSON,                   -- Соцсети {"instagram": "@yess"}
    bank_account VARCHAR(100),            -- Банковский счет
    max_discount_percent DECIMAL(5,2),   -- Максимальная скидка
    cashback_rate DECIMAL(5,2),          -- Процент кэшбэка
    owner_id INTEGER REFERENCES users(id), -- Владелец
    is_active BOOLEAN DEFAULT TRUE,      -- Активен ли
    is_verified BOOLEAN DEFAULT FALSE,  -- Проверен ли админом
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Локации партнеров
partner_locations (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    address VARCHAR(500),                -- Адрес
    latitude DECIMAL(10,8),              -- Широта
    longitude DECIMAL(11,8),             -- Долгота
    phone_number VARCHAR(50),            -- Телефон локации
    working_hours JSON,                  -- Часы работы
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Сотрудники партнеров
partner_employees (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    user_id INTEGER REFERENCES users(id),
    position VARCHAR(100),               -- Должность
    hired_at TIMESTAMP DEFAULT NOW()
);

-- Акции партнеров
promotions (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES partners(id),
    title VARCHAR(255) NOT NULL,         -- Название акции
    description TEXT,                    -- Описание
    discount_percent INTEGER,           -- Процент скидки
    valid_until DATE,                   -- Действует до
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Как работают запросы к партнерам

### 1. Получение списка партнеров

```python
# GET /api/v1/partner/list?category=restaurant&active=true
async def get_partners(
    category: Optional[str] = None,
    active: bool = True,
    db: Session = Depends(get_db)
):
    # Строим запрос
    query = db.query(Partner)
    
    # Фильтруем по активности
    if active:
        query = query.filter(Partner.is_active == True)
    
    # Фильтруем по категории
    if category:
        query = query.filter(Partner.category == category)
    
    # Выполняем запрос
    partners = query.all()
    
    return partners
```

**SQL запрос:**
```sql
SELECT * FROM partners 
WHERE is_active = true 
AND category = 'restaurant';
```

### 2. Получение детальной информации о партнере

```python
# GET /api/v1/partner/123
async def get_partner(partner_id: int, db: Session = Depends(get_db)):
    # Получаем партнера с его локациями
    partner = db.query(Partner)\
        .options(joinedload(Partner.locations))\
        .filter(Partner.id == partner_id)\
        .first()
    
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return partner
```

**SQL запрос:**
```sql
SELECT p.*, pl.* 
FROM partners p 
LEFT JOIN partner_locations pl ON p.id = pl.partner_id 
WHERE p.id = 123;
```

### 3. Поиск партнеров по геолокации

```python
# GET /api/v1/partner/locations?latitude=42.8746&longitude=74.6122&radius=5
async def get_partner_locations(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius: float = 10.0,
    db: Session = Depends(get_db)
):
    # Запрос с геолокацией
    query = db.query(PartnerLocation)\
        .join(Partner)\
        .filter(PartnerLocation.is_active == True)
    
    if latitude and longitude:
        # Используем формулу гаверсинуса для расчета расстояния
        query = query.filter(
            func.acos(
                func.sin(func.radians(latitude)) * 
                func.sin(func.radians(PartnerLocation.latitude)) +
                func.cos(func.radians(latitude)) * 
                func.cos(func.radians(PartnerLocation.latitude)) *
                func.cos(func.radians(longitude) - func.radians(PartnerLocation.longitude))
            ) * 6371 <= radius  # 6371 км - радиус Земли
        )
    
    locations = query.all()
    return locations
```

**SQL запрос:**
```sql
SELECT pl.*, p.name as partner_name, p.max_discount_percent
FROM partner_locations pl
JOIN partners p ON pl.partner_id = p.id
WHERE pl.is_active = true
AND (
    6371 * acos(
        sin(radians(42.8746)) * sin(radians(pl.latitude)) +
        cos(radians(42.8746)) * cos(radians(pl.latitude)) *
        cos(radians(74.6122) - radians(pl.longitude))
    ) <= 5
);
```

### 4. Создание нового партнера

```python
# POST /api/v1/partner/create
async def create_partner(
    partner_data: PartnerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Создаем партнера
    partner = Partner(
        name=partner_data.name,
        description=partner_data.description,
        category=partner_data.category,
        city_id=partner_data.city_id,
        phone=partner_data.phone,
        email=partner_data.email,
        website=partner_data.website,
        max_discount_percent=partner_data.max_discount_percent,
        cashback_rate=partner_data.cashback_rate,
        owner_id=current_user.id,
        is_active=False,  # Требует проверки админа
        is_verified=False
    )
    
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    return partner
```

**SQL запрос:**
```sql
INSERT INTO partners (
    name, description, category, city_id, phone, email, 
    website, max_discount_percent, cashback_rate, owner_id,
    is_active, is_verified, created_at
) VALUES (
    'Новый ресторан', 'Описание', 'restaurant', 1, 
    '+996555123456', 'info@restaurant.kg', 'https://restaurant.kg',
    20.00, 5.00, 123, false, false, NOW()
);
```

## 📊 Примеры реальных запросов

### 1. Получение партнеров по категориям

```python
# Рестораны
restaurants = db.query(Partner)\
    .filter(Partner.category == 'restaurant')\
    .filter(Partner.is_active == True)\
    .all()

# Магазины
shops = db.query(Partner)\
    .filter(Partner.category == 'shop')\
    .filter(Partner.is_active == True)\
    .all()

# Кафе
cafes = db.query(Partner)\
    .filter(Partner.category == 'cafe')\
    .filter(Partner.is_active == True)\
    .all()
```

### 2. Поиск партнеров с высоким кэшбэком

```python
high_cashback_partners = db.query(Partner)\
    .filter(Partner.cashback_rate >= 10.0)\
    .filter(Partner.is_active == True)\
    .order_by(Partner.cashback_rate.desc())\
    .all()
```

### 3. Статистика партнеров

```python
# Статистика по категориям
category_stats = db.query(
    Partner.category,
    func.count(Partner.id).label('count'),
    func.avg(Partner.cashback_rate).label('avg_cashback')
).filter(Partner.is_active == True)\
 .group_by(Partner.category)\
 .all()

# Топ партнеры по количеству заказов
top_partners = db.query(
    Partner.id,
    Partner.name,
    func.count(Order.id).label('order_count'),
    func.sum(Order.amount).label('total_revenue')
).join(Order, Partner.id == Order.partner_id)\
 .group_by(Partner.id, Partner.name)\
 .order_by(desc('order_count'))\
 .limit(10)\
 .all()
```

### 4. Получение акций партнера

```python
# Активные акции партнера
active_promotions = db.query(Promotion)\
    .filter(Promotion.partner_id == partner_id)\
    .filter(Promotion.is_active == True)\
    .filter(Promotion.valid_until >= datetime.now().date())\
    .all()
```

## 🚀 Оптимизация запросов партнеров

### Индексы для быстрого поиска

```sql
-- Основные индексы
CREATE INDEX idx_partners_category ON partners(category);
CREATE INDEX idx_partners_city_id ON partners(city_id);
CREATE INDEX idx_partners_is_active ON partners(is_active);
CREATE INDEX idx_partners_is_verified ON partners(is_verified);
CREATE INDEX idx_partners_cashback_rate ON partners(cashback_rate);

-- Составные индексы
CREATE INDEX idx_partners_active_category ON partners(is_active, category);
CREATE INDEX idx_partners_city_active ON partners(city_id, is_active);

-- Индексы для локаций
CREATE INDEX idx_partner_locations_partner_id ON partner_locations(partner_id);
CREATE INDEX idx_partner_locations_coordinates ON partner_locations(latitude, longitude);
CREATE INDEX idx_partner_locations_active ON partner_locations(is_active);

-- Индексы для акций
CREATE INDEX idx_promotions_partner_id ON promotions(partner_id);
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_valid_until ON promotions(valid_until);
```

### Кэширование часто запрашиваемых данных

```python
from app.core.cache import cache

@cache.cached(timeout=300)  # Кэш на 5 минут
async def get_partner_categories():
    """Получение списка категорий партнеров"""
    categories = db.query(Partner.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

@cache.cached(timeout=600)  # Кэш на 10 минут
async def get_active_partners():
    """Получение всех активных партнеров"""
    return db.query(Partner)\
        .filter(Partner.is_active == True)\
        .filter(Partner.is_verified == True)\
        .all()

@cache.cached(timeout=1800)  # Кэш на 30 минут
async def get_partner_locations_map():
    """Получение всех локаций для карты"""
    return db.query(PartnerLocation)\
        .join(Partner)\
        .filter(PartnerLocation.is_active == True)\
        .filter(Partner.is_active == True)\
        .all()
```

## 🔄 Связи с другими таблицами

### Связь с заказами
```python
# Получение заказов партнера
partner_orders = db.query(Order)\
    .filter(Order.partner_id == partner_id)\
    .order_by(Order.created_at.desc())\
    .all()

# Статистика заказов партнера
order_stats = db.query(
    func.count(Order.id).label('total_orders'),
    func.sum(Order.amount).label('total_revenue'),
    func.avg(Order.amount).label('average_order'),
    func.count(func.distinct(Order.user_id)).label('unique_customers')
).filter(Order.partner_id == partner_id)\
 .first()
```

### Связь с пользователями (владельцы)
```python
# Получение партнеров пользователя
user_partners = db.query(Partner)\
    .filter(Partner.owner_id == user_id)\
    .all()

# Получение сотрудников партнера
partner_employees = db.query(User)\
    .join(PartnerEmployee, User.id == PartnerEmployee.user_id)\
    .filter(PartnerEmployee.partner_id == partner_id)\
    .all()
```

## 📱 API эндпоинты для партнеров

### Основные эндпоинты
```python
# Получение списка партнеров
GET /api/v1/partner/list
GET /api/v1/partner/list?category=restaurant
GET /api/v1/partner/list?city_id=1

# Получение партнера по ID
GET /api/v1/partner/123

# Получение локаций партнеров
GET /api/v1/partner/locations
GET /api/v1/partner/locations?partner_id=123
GET /api/v1/partner/locations?latitude=42.8746&longitude=74.6122&radius=5

# Получение категорий
GET /api/v1/partner/categories

# Создание партнера (только для авторизованных)
POST /api/v1/partner/create

# Обновление партнера (только владелец)
PUT /api/v1/partner/123

# Получение акций партнера
GET /api/v1/partner/123/promotions
```

## 🎯 Заключение

**Архитектура хранения партнеров:**

✅ **Одна БД** - PostgreSQL для всего приложения  
✅ **Структурированные данные** - четкие таблицы и связи  
✅ **Быстрые запросы** - индексы и оптимизация  
✅ **Кэширование** - часто запрашиваемые данные  
✅ **Геолокация** - поиск по координатам  
✅ **Масштабируемость** - готово к росту  

**Все данные партнеров хранятся в одной БД, но логически разделены по таблицам!** 🚀
