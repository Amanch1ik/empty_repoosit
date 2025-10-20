# 📱 YESS Loyalty Frontend

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.70+-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)
![Expo](https://img.shields.io/badge/Expo-49+-000020.svg)
![Vite](https://img.shields.io/badge/Vite-4.0+-646CFF.svg)

**Мобильное приложение системы лояльности для Кыргызстана**

</div>

---

## 🌟 **ОСОБЕННОСТИ**

### 📱 **Мобильное приложение**
- ✅ React Native с Expo
- ✅ TypeScript для типобезопасности
- ✅ Нативная производительность
- ✅ Кроссплатформенность (iOS/Android)

### 🎨 **UI/UX**
- ✅ Современный дизайн
- ✅ Адаптивная верстка
- ✅ Темная/светлая тема
- ✅ Анимации и переходы

### 🌍 **Локализация**
- ✅ Кыргызский язык (основной)
- ✅ Русский язык
- ✅ Английский язык
- ✅ Автоматическое определение языка

### 🔐 **Безопасность**
- ✅ JWT аутентификация
- ✅ Биометрическая авторизация
- ✅ Шифрование данных
- ✅ Безопасное хранение токенов

---

## 🚀 **БЫСТРЫЙ СТАРТ**

### **Предварительные требования**
- Node.js 16+
- npm или yarn
- Expo CLI
- Android Studio / Xcode (для нативной сборки)

### **Установка**

```bash
# Клонирование репозитория
git clone https://github.com/Amanch1ik/Bonussss-APPP.git
cd Bonussss-APPP/frontend

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск на устройстве
npm run start
```

### **Сборка для продакшена**

```bash
# Сборка для Android
npm run build:android

# Сборка для iOS
npm run build:ios

# Сборка для веб
npm run build:web
```

---

## 📁 **СТРУКТУРА ПРОЕКТА**

```
frontend/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── AccessibleButton.tsx
│   │   ├── BottomNav.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   ├── pages/              # Страницы приложения
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Partners.tsx
│   │   └── ...
│   ├── services/           # API сервисы
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   └── ...
│   ├── store/              # Управление состоянием
│   │   ├── StoreProvider.tsx
│   │   └── useAuthStore.ts
│   ├── hooks/              # Кастомные хуки
│   │   ├── usePerformance.ts
│   │   └── ...
│   ├── utils/              # Утилиты
│   │   └── errorHandler.ts
│   └── types/              # TypeScript типы
│       └── api.ts
├── app.json               # Конфигурация Expo
├── package.json           # Зависимости
└── tsconfig.json          # Конфигурация TypeScript
```

---

## 🎨 **КОМПОНЕНТЫ**

### **Основные компоненты**

- **AccessibleButton** - Доступная кнопка
- **BottomNav** - Нижняя навигация
- **ErrorBoundary** - Обработка ошибок
- **PartnerMap** - Карта партнеров
- **ResponsiveContainer** - Адаптивный контейнер

### **Страницы**

- **Dashboard** - Главная страница
- **Login** - Авторизация
- **Partners** - Список партнеров
- **Profile** - Профиль пользователя
- **BonusCard** - Бонусная карта

---

## 🔧 **КОНФИГУРАЦИЯ**

### **app.json**

```json
{
  "expo": {
    "name": "YESS Loyalty",
    "slug": "yess-loyalty",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    },
    "platforms": ["ios", "android", "web"],
    "ios": {
      "bundleIdentifier": "com.yessloyalty.app"
    },
    "android": {
      "package": "com.yessloyalty.app"
    }
  }
}
```

### **Переменные окружения**

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_VERSION=v1

# Firebase
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id

# Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_key
```

---

## 📱 **ЭКРАНЫ ПРИЛОЖЕНИЯ**

### **Аутентификация**
- Регистрация с номером телефона
- Вход по номеру/email
- Восстановление пароля
- Биометрическая авторизация

### **Главная**
- Дашборд с балансом
- Быстрые действия
- Уведомления
- Последние транзакции

### **Партнеры**
- Список партнеров
- Карта с локациями
- Детали партнера
- QR-сканер

### **Платежи**
- Пополнение кошелька
- История платежей
- Вывод средств
- Настройки платежей

### **Профиль**
- Личные данные
- Настройки уведомлений
- Язык и валюта
- Помощь и поддержка

---

## 🔌 **ИНТЕГРАЦИЯ С BACKEND**

### **API сервисы**

```typescript
// Авторизация
import { authService } from './services/auth.service';

// Регистрация
const user = await authService.register({
  name: 'Иван Иванов',
  phone: '+996507123456',
  password: 'password123'
});

// Вход
const tokens = await authService.login({
  phone: '+996507123456',
  password: 'password123'
});
```

### **Управление состоянием**

```typescript
// Zustand store
import { useAuthStore } from './store/useAuthStore';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

---

## 🎯 **ФУНКЦИОНАЛЬНОСТЬ**

### **Платежи**
- Пополнение через банки КР
- QR-коды для оплаты
- История транзакций
- Уведомления о платежах

### **Лояльность**
- Система достижений
- Реферальная программа
- Кэшбэк и бонусы
- Акции и промо-коды

### **Партнеры**
- Поиск по категориям
- Геолокация
- Отзывы и рейтинги
- Скидки и акции

### **Уведомления**
- Push уведомления
- SMS уведомления
- Email уведомления
- Настройки уведомлений

---

## 🚀 **ДЕПЛОЙ**

### **App Store / Google Play**

```bash
# Сборка для продакшена
expo build:android
expo build:ios

# Загрузка в магазины
expo upload:android
expo upload:ios
```

### **Веб-версия**

```bash
# Сборка для веб
npm run build:web

# Деплой на Vercel/Netlify
npm run deploy
```

---

## 🧪 **ТЕСТИРОВАНИЕ**

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage

# E2E тесты
npm run test:e2e
```

---

## 📊 **АНАЛИТИКА**

### **Метрики**
- Активные пользователи
- Время сессии
- Конверсия платежей
- Популярные партнеры

### **Инструменты**
- Firebase Analytics
- Sentry для ошибок
- Mixpanel для событий
- Custom метрики

---

## 🤝 **КОНТРИБЬЮТИНГ**

1. Форкните репозиторий
2. Создайте ветку (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

## 📄 **ЛИЦЕНЗИЯ**

MIT License - см. файл [LICENSE](../LICENSE) для деталей.

---

<div align="center">

**Сделано с ❤️ для Кыргызстана**

</div>