#!/bin/bash

echo "==================================================="
echo "Сброс зависимостей проекта Taskventure"
echo "==================================================="

echo
echo "[1/4] Удаление существующих node_modules и файлов блокировки..."
rm -rf node_modules package-lock.json yarn.lock

echo
echo "[2/4] Установка зависимостей с указанными версиями..."
npm install --legacy-peer-deps

echo
echo "[3/4] Установка правильных версий ajv и ajv-keywords..."
npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps --save

echo
echo "[4/4] Проверка типов TypeScript..."
npx tsc --noEmit

echo
echo "==================================================="
echo "Сброс зависимостей завершен!"
echo "==================================================="
echo
echo "Теперь вы можете запустить проект:"
echo "npm start"
echo
echo "Если у вас всё ещё есть проблемы, обратитесь к документации:"
echo "- ajv-fix.md для проблем с ajv"
echo "- TROUBLESHOOTING.md для других известных проблем"
echo "===================================================" 