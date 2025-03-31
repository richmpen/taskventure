# Исправление ошибок с AnimatePresence

Этот документ содержит различные способы исправления ошибки типизации с компонентом `AnimatePresence` из библиотеки framer-motion.

## Ошибка

```
ERROR in src/pages/Battle.tsx:388:8
TS2786: 'AnimatePresence' cannot be used as a JSX component.
  Its return type 'Element | undefined' is not a valid JSX element.
```

## Решение 1: Приведение типа AnimatePresence

Измените код в файлах, где используется AnimatePresence:

```tsx
// src/pages/Battle.tsx, src/pages/Tasks.tsx и другие файлы с AnimatePresence

// Вместо
<AnimatePresence mode="sync">
  {showReward && (...)}
</AnimatePresence>

// Используйте
{(() => {
  const AP = AnimatePresence as any;
  return <AP mode="sync">{showReward && (...)}</AP>;
})()}
```

## Решение 2: Создать файл типов

Создайте файл `src/typings.d.ts` со следующим содержимым:

```typescript
declare namespace JSX {
  interface IntrinsicElements {
    // Явное определение AnimatePresence как JSX-элемента
    'AnimatePresence': any;
  }
}

// Дополнительные объявления типов для framer-motion
declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
    exitBeforeEnter?: boolean;
    custom?: any;
  }

  export const AnimatePresence: React.FunctionComponent<AnimatePresenceProps>;
}
```

## Решение 3: Обновить tsconfig.json

Обновите `tsconfig.json`, добавив следующие настройки:

```json
{
  "compilerOptions": {
    // Другие настройки...
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## Решение 4: Создать компонент-обертку

Создайте собственный компонент-обертку для AnimatePresence:

```tsx
// src/components/SafeAnimatePresence.tsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';

interface SafeAnimatePresenceProps {
  children: React.ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  onExitComplete?: () => void;
}

export const SafeAnimatePresence: React.FC<SafeAnimatePresenceProps> = ({ 
  children, 
  mode, 
  initial, 
  onExitComplete 
}) => {
  const AP = AnimatePresence as any;
  return (
    <AP mode={mode} initial={initial} onExitComplete={onExitComplete}>
      {children}
    </AP>
  );
};
```

Затем используйте этот компонент в своем коде:

```tsx
// Вместо
<AnimatePresence mode="sync">
  {showReward && (...)}
</AnimatePresence>

// Используйте
<SafeAnimatePresence mode="sync">
  {showReward && (...)}
</SafeAnimatePresence>
```

## Решение 5: Использовать выпуск с совместимыми версиями

Наиболее надежное решение - установить совместимые версии всех зависимостей:

```bash
# Удалить node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Установить зависимости с точными версиями
npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0 framer-motion@10.16.4 typescript@5.1.6 @types/react@18.2.21 @types/react-dom@18.2.7
```

## Решение 6: Использовать ключевое слово presence

В некоторых версиях framer-motion проблема решается добавлением атрибута `presence`:

```tsx
<AnimatePresence mode="sync" presence>
  {showReward && (...)}
</AnimatePresence>
```

## Решение 7: Использовать Fragment в качестве корневого элемента

```tsx
<>
  <AnimatePresence mode="sync">
    {showReward && (...)}
  </AnimatePresence>
</>
```

## Примечание

Выбор решения зависит от версий ваших зависимостей. Рекомендуется сначала попробовать установить совместимые версии, а затем, если проблема сохраняется, применить одно из предложенных решений. 