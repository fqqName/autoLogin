#!/bin/bash

echo "Waiting for notification from Wberries..."

# Ждем максимум 60 секунд
END=$((SECONDS+60))

while [ $SECONDS -lt $END ]; do
    # Читаем уведомления
    DUMP=$(adb shell dumpsys notification)
    
    # Ищем блок, где есть заголовок или текст Wberries
    # grep -A 10 захватывает 10 строк после совпадения, чтобы найти текст кода
    MATCH=$(echo "$DUMP" | grep -A 10 "android.title=.*Wberries")

    if [ ! -z "$MATCH" ]; then
        # Ищем 6 цифр в этом блоке
        CODE=$(echo "$MATCH" | grep -oE '[0-9]{6}' | head -n 1)
        
        if [ ! -z "$CODE" ]; then
            echo "$CODE"
            exit 0
        fi
    fi
    
    sleep 1
done

echo "Timeout"
exit 1