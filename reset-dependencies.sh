#!/bin/bash

echo "Скрипт для сброса и переустановки зависимостей проекта Taskventure"
echo

echo "1. Удаление node_modules и lock-файлов..."
rm -rf node_modules package-lock.json yarn.lock
echo "Директории и файлы удалены."
echo

echo "2. Установка зависимостей..."
echo
echo "ВНИМАНИЕ: Убедитесь, что у вас установлены Node.js и npm версии, указанные в README-versions.md"
echo

read -p "Для продолжения нажмите Enter или Ctrl+C для отмены..."

npm install --legacy-peer-deps

echo
echo "Установка завершена. Проверка наличия ошибок..."
echo

echo "3. Дополнительные зависимости для исправления проблем совместимости..."
npm install ajv@8.12.0 --legacy-peer-deps

echo
echo "4. Запуск TypeScript для проверки на ошибки..."
npx tsc --noEmit

echo
echo "Если выше нет ошибок - установка прошла успешно!"
echo "Если есть ошибки - попробуйте решения из файла AnimatePresence-fix.md"
echo
echo "Для запуска проекта выполните: npm start"
echo
read -p "Нажмите Enter для завершения..." 