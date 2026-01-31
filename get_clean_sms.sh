#!/bin/bash

# 1. ОЧИСТКА: Удаляем ВСЕ старые уведомления перед стартом.
# Это гарантирует, что мы не прочитаем старый код.
echo "Cleaning old notifications..."
adb shell service call notification 1 > /dev/null

# Даем секунду системе на очистку
sleep 2

echo "Waiting for NEW SMS from Wberries..."

# Засекаем время для таймаута (60 секунд)
END=$((SECONDS+60))

while [ $SECONDS -lt $END ]; do
    # 2. ПОЛУЧЕНИЕ: Читаем текущие уведомления
    # Ищем отправителя, содержащего "Wberries" (подойдет и для Wberries.by)
    # grep -A 10 берет 10 строк после совпадения, чтобы захватить текст сообщения
    DUMP=$(adb shell dumpsys notification | grep -A 10 "android.title=.*Wberries")

    if [ ! -z "$DUMP" ]; then
        # 3. ФИЛЬТРАЦИЯ: Ищем текст сообщения (android.text)
        TEXT_LINE=$(echo "$DUMP" | grep "android.text")
        
        if [ ! -z "$TEXT_LINE" ]; then
            # 4. ИЗВЛЕЧЕНИЕ: Ищем 6 цифр подряд
            CODE=$(echo "$TEXT_LINE" | grep -oE '[0-9]{6}' | head -n 1)
            
            if [ ! -z "$CODE" ]; then
                echo "$CODE"
                exit 0
            fi
        fi
    fi
    
    # Ждем 1 секунду перед следующей проверкой
    sleep 1
done

echo "Timeout: SMS not received"
exit 1