# Навигация по проекту для ИИ

Назначение пакета — восстанавливать контекст разработки без переписки и внешних локальных материалов. Начальная инструкция: [AGENTS.md](../../AGENTS.md).

## Что читать

| Задача | Минимальный контекст |
| --- | --- |
| Начало работы | [STACK.md](STACK.md), [DOMAIN.md](DOMAIN.md), [MODULES.md](MODULES.md) |
| Экран, форма, диалог, кабинет | [FRONTEND.md](FRONTEND.md), [API.md](API.md), локальный `frontend/docs/ai/CONTEXT.md` |
| Модель, миграция, операция, права | [BACKEND.md](BACKEND.md), [schema.json](schema.json), локальный `backend/docs/ai/CONTEXT.md` |
| Совместная разработка | [API.md](API.md), [CHECKS.md](CHECKS.md) |
| Неясное правило | [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md); не додумывать поведение |

## Текущее состояние

Монорепозиторий имеет два отдельных IDE-корня: `backend/` и `frontend/`. Каждый содержит собственный `AGENTS.md` и самодостаточный `docs/ai/CONTEXT.md`.

Backend — стандартный каркас Django 6.1.1 с admin endpoint, `requirements.txt` и конфигурацией через `.env`. PostgreSQL 16 для локальной разработки запускается из корневого `compose.yaml`; Django остаётся локальным процессом. Прикладные apps, REST endpoints, OpenAPI, фоновые задачи и автоматические тесты пока не созданы.

Frontend — Nuxt 4.5.2, Nuxt UI 4.11, Pinia и Tailwind CSS 4. Существуют scripts `dev`, `build`, `preview`, `lint`, `typecheck`; страницы пока являются starter-шаблоном. Vitest, Playwright, API-клиент и generated-типы пока не подключены. Среда при сверке: Python 3.13.9, Node 24.21.0, npm 11.19.0.

Архитектура — модульный монолит: один Django API, один Nuxt-клиент, одна PostgreSQL, модули M1–M8. Модули не являются микросервисами.

Автономная копия демонстрационного прототипа находится в `static-prototype/`. Точка входа — `static-prototype/index.html`, открывается двойным щелчком без сборки и сервера. Это отдельный HTML/CSS/JavaScript-прототип, не замена Nuxt и не реализация API. Инструкции и ограничения: [static-prototype/README.md](../../static-prototype/README.md).

## Статус документов

- [DOMAIN.md](DOMAIN.md) содержит бизнес-правила, обязательные для обеих сторон.
- [MODULES.md](MODULES.md) определяет владение сущностями и сценариями.
- [schema.json](schema.json) — логическая модель хранения. Она не является миграцией, ORM-моделью или API-контрактом.
- [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) перечисляет неопределённости. Они блокируют только зависимую часть задачи.
- `backend/` и `frontend/` показывают только фактически реализованное состояние; starter-код не является продуктовым требованием.

## Работа двух чатов

Backend владеет OpenAPI. После изменения API backend-чат передаёт frontend-чату метод и путь, auth/permissions, request/response DTO, ошибки, правила повторов и путь к схеме. Frontend обновляет generated-типы воспроизводимой командой и не исправляет их вручную.

Если API ещё не реализован, frontend использует только явно описанный mock-контракт и помечает экран как работающий на моках. Общее решение фиксируется в [API.md](API.md) или [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md), чтобы два чата не закрепили разные трактовки.

## Поддержание актуальности

После завершённой функции обновлять фактические точки входа и команды здесь, а при необходимости — локальные контексты. При изменении бизнес-правила обновлять DOMAIN и проверки; при изменении API — OpenAPI, API.md, клиент и тесты; при изменении хранения — Django migration и schema.json.
