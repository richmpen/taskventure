# Taskventure - Совместимые версии и установка

В этом документе перечислены точные версии зависимостей, необходимые для корректной работы проекта Taskventure, а также инструкции по их правильной установке.

## Требуемые версии

| Зависимость | Версия | Описание |
|-------------|--------|----------|
| Node.js | 16.x | Среда выполнения JavaScript |
| npm | 8.x | Менеджер пакетов Node.js |
| React | 18.2.0 | JavaScript библиотека для создания пользовательских интерфейсов |
| React DOM | 18.2.0 | Пакет для работы React с DOM |
| React Router DOM | 6.16.0 | Маршрутизация для React приложений |
| TypeScript | 5.1.6 | Типизированный JavaScript |
| Framer Motion | 10.16.4 | Библиотека для анимаций |
| TailwindCSS | 3.3.3 | Утилитарный CSS-фреймворк |
| DaisyUI | 3.7.4 | Компонентная библиотека для TailwindCSS |
| LocalForage | 1.10.0 | Библиотека для работы с хранилищем браузера |
| date-fns | 2.30.0 | Библиотека для работы с датами |
| uuid | 9.0.0 | Генерация уникальных идентификаторов |
| ajv | 8.12.0 | JSON Schema валидатор |
| ajv-keywords | 5.1.0 | Ключевые слова для ajv |

## Очистка и установка

Выполните следующие команды для правильной настройки проекта:

### 1. Очистка текущих зависимостей (если проект уже инициализирован)

```bash
# Удаление node_modules и package-lock.json
rm -rf node_modules package-lock.json yarn.lock
```

### 2. Обновление файла package.json

Замените содержимое вашего package.json на следующее:

```json
{
  "name": "taskventure",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "6.16.0",
    "react-transition-group": "4.4.5",
    "framer-motion": "10.16.4",
    "tailwindcss": "3.3.3",
    "postcss": "8.4.31",
    "autoprefixer": "10.4.15",
    "typescript": "5.1.6",
    "@types/react": "18.2.21",
    "@types/react-dom": "18.2.7",
    "@types/react-router-dom": "5.3.3",
    "zustand": "4.4.1",
    "localforage": "1.10.0",
    "daisyui": "3.7.4",
    "date-fns": "2.30.0",
    "uuid": "9.0.0",
    "@types/uuid": "9.0.3",
    "ajv": "8.12.0",
    "ajv-keywords": "5.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "react-scripts": "5.0.1",
    "@typescript-eslint/eslint-plugin": "6.7.0",
    "@typescript-eslint/parser": "6.7.0",
    "eslint": "8.49.0",
    "eslint-plugin-react": "7.33.2",
    "eslint-plugin-react-hooks": "4.6.0"
  }
}
```

### 3. Обновление tsconfig.json

Убедитесь, что ваш tsconfig.json содержит следующее:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src"
  },
  "include": [
    "src"
  ]
}
```

### 4. Установка зависимостей

```bash
# Установка с точными версиями
npm install --legacy-peer-deps
```

### 5. Решение проблемы с ajv

Если вы видите ошибку "Cannot find module 'ajv/dist/compile/codegen'", выполните:

```bash
npm install ajv@8.12.0 ajv-keywords@5.1.0 --legacy-peer-deps
```

### 6. Исправление проблемы с AnimatePresence

Если после установки все равно возникает ошибка с AnimatePresence, добавьте следующую строку в ваш файл src/index.tsx перед импортом React:

```typescript
/// <reference types="react/jsx-runtime" />
```

Или создайте файл typings.d.ts в корне проекта со следующим содержимым:

```typescript
declare namespace JSX {
  interface IntrinsicElements {
    // Убедиться, что AnimatePresence признается валидным компонентом JSX
    'AnimatePresence': any;
  }
}
```

## Альтернативное решение для AnimatePresence

Если проблема с AnimatePresence сохраняется, вы можете изменить все места, где используется AnimatePresence, следующим образом:

```tsx
// Замените
<AnimatePresence mode="sync">
  {children}
</AnimatePresence>

// На
{(() => {
  const AP = AnimatePresence as any;
  return <AP mode="sync">{children}</AP>;
})()}
```

## Установка Node.js и npm

Если у вас еще не установлен Node.js и npm, выполните следующие шаги:

### Windows

1. Скачайте установщик Node.js v16.x с официального сайта: https://nodejs.org/dist/latest-v16.x/
2. Запустите установщик и следуйте инструкциям
3. Перезагрузите компьютер

### macOS (с использованием Homebrew)

```bash
brew install node@16
```

### Linux (Ubuntu, Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Проверка установки

После установки проверьте версии:

```bash
node -v  # Должен показать v16.x.x
npm -v   # Должен показать 8.x.x
```

## Запуск проекта

```bash
npm start
``` 