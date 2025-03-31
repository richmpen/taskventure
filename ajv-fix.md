# Решение проблемы с ajv в проекте Taskventure

Если вы сталкиваетесь с ошибкой:

```
Cannot find module 'ajv/dist/compile/codegen'
Require stack:
- node_modules\ajv-keywords\dist\definitions\typeof.js
- node_modules\ajv-keywords\dist\keywords\typeof.js
- ...
```

Это происходит из-за несоответствия версий `ajv` и `ajv-keywords` в вашем проекте.

## Быстрое решение

Выполните следующую команду:

```bash
npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --save
```

## Подробное объяснение проблемы

Проблема возникает из-за того, что:

1. `react-scripts` (через webpack) использует `schema-utils`, который зависит от `ajv-keywords`
2. `ajv-keywords` версии 5.x требует `ajv` версии 8.x, но ожидает, что файлы будут находиться в определенной структуре
3. При установке зависимостей может произойти перезапись версий

## Полное решение

1. Удалите node_modules и package-lock.json:
```bash
rm -rf node_modules package-lock.json
```

2. Обновите package.json, добавив явное указание версии ajv и resolutions:
```json
{
  "dependencies": {
    // ... другие зависимости
    "ajv": "6.12.6"
  },
  "resolutions": {
    "ajv": "6.12.6"
  }
}
```

3. Установите зависимости с указанием точных версий:
```bash
npm install --legacy-peer-deps
npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --save
```

4. Создайте файл .npmrc в корне проекта для предотвращения конфликтов:
```
legacy-peer-deps=true
```

## Почему именно версии 6.12.6 и 3.5.2?

Эти версии совместимы с `react-scripts` версии 5.0.1 и правильно работают вместе. Более новые версии `ajv` (8.x) имеют другую структуру импортов, что вызывает ошибки, если `ajv-keywords` ожидает другую структуру.

## Проверка решения

После успешной установки этих версий выполните:

```bash
npm start
```

Приложение должно запуститься без ошибок, связанных с ajv.

## Если проблема остаётся

Если проблема сохраняется, попробуйте следующие шаги:

1. Очистите кэш npm:
```bash
npm cache clean --force
```

2. Удалите node_modules и все файлы блокировки:
```bash
rm -rf node_modules package-lock.json yarn.lock
```

3. Запустите скрипт сброса зависимостей:
```bash
./reset-deps.bat  # Для Windows
# или
./reset-deps.sh   # Для Linux/macOS
```

## Альтернативное решение

Если все вышеперечисленные методы не помогли, можно попробовать откатиться к версии react-scripts 4.0.3, которая имеет меньше проблем с зависимостями:

```bash
npm install react-scripts@4.0.3 --legacy-peer-deps --save
```

Однако это может потребовать дополнительных изменений в других частях проекта. 