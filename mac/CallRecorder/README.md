# Запис дзвінків на Mac

Застосунок у рядку меню. Коли дзвінок з iPhone прийнято чи зроблено на Mac
(Continuity), він тихо записує обидві сторони й надсилає запис на сайт →
транскрипт, самарі, Telegram, адмінка «Розмови».

- Голос співрозмовника — Core Audio process tap (macOS 14.4+), без драйверів.
- Голос адвоката — мікрофон (або AirPods), зведений у моно.
- Дзвінок визначається за тим, яка програма тримає мікрофон
  (`callservicesd`, `avconferenced`, FaceTime; за бажанням — Viber, WhatsApp, Telegram).
- Записи коротші за 20 с не надсилаються. Без інтернету лежать у черзі
  `~/Library/Application Support/CallRecorder/queue` і доходять пізніше.
- Журнал: `~/Library/Logs/CallRecorder.log`.

## Збірка

```bash
./build.sh            # build/CallRecorder.app (Apple Silicon + Intel)
```

## Встановлення на Mac адвоката

1. Скопіювати `CallRecorder.app` у «Програми», зняти карантин:
   `xattr -dr com.apple.quarantine /Applications/CallRecorder.app`.
2. Запустити, вставити токен `INGEST_TOKEN` (Vercel → Environment Variables).
3. Дозволити мікрофон і «Запис звуку системи».
4. iPhone: Параметри → Телефон → Виклики на інших пристроях → увімкнути Mac.
   Mac: FaceTime → Параметри → «Виклики з iPhone».

Перевірка з терміналу:

```bash
CallRecorder.app/Contents/MacOS/CallRecorder --diagnose             # хто тримає мікрофон
CallRecorder.app/Contents/MacOS/CallRecorder --test-record 10 t.m4a # пробний запис
```
