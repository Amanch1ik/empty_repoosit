# 🚀 Быстрый старт Bonus APP

## ⚡ Запуск за 5 минут

### 1. Backend (Python/FastAPI)
```bash
cd yess-backend

# Установка зависимостей
pip install -r requirements.txt

# Настройка окружения
cp env.example .env

# Запуск сервера
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend (React Native)
```bash
cd frontend

# Установка зависимостей
npm install

# Запуск приложения
npm run dev
```

### 3. Проверка работы
- **Backend API**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000
- **Health check**: http://localhost:8000/health

## 🔧 Основные API endpoints

```http
# Аутентификация
POST /api/v1/auth/register
POST /api/v1/auth/login

# Платежи
POST /api/v1/payments/replenish
GET  /api/v1/payments/balance
GET  /api/v1/payments/transactions

# Партнеры
GET  /api/v1/partner/list
GET  /api/v1/partner/{id}
GET  /api/v1/partner/locations

# Кошелек
GET  /api/v1/wallet/balance
```

## 📱 Тестирование

### Регистрация пользователя
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+996555123456",
    "password": "password123"
  }'
```

### Получение партнеров
```bash
curl "http://localhost:8000/api/v1/partner/list"
```

## 🎯 Готово к разработке!

**Все основные компоненты реализованы и готовы к использованию.**
