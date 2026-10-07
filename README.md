# Нортландия онлайн

«Нортландия онлайн» — образовательная игровая платформа для детской школы. Дети выбирают мастерские, общаются с персонажами, берут и выполняют задания, получают токены, репутацию и достижения. Родители и сотрудники работают через отдельные кабинеты, а права, переходы статусов и начисления проверяются на сервере.

Проект находится на раннем этапе разработки. Backend содержит взрослый Account, Django admin и общую основу REST API; frontend — главную страницу с шапкой, футером и светлой/тёмной темой. Прикладных API endpoints и интеграции между приложениями пока нет. Автономный прототип интерфейса находится в `static-prototype/`, утверждённые правила и границы модулей — в `docs/ai/`. Порядок дальнейшей реализации и текущее состояние задач приведены в [`ROADMAP.md`](ROADMAP.md).

## Структура монорепозитория

| Путь | Содержимое |
| --- | --- |
| [`backend/`](backend/) | Django-проект, REST API и серверная бизнес-логика |
| [`frontend/`](frontend/) | Клиентское приложение на Nuxt |
| [`static-prototype/`](static-prototype/) | Автономный HTML/CSS/JavaScript-прототип без сборки и сервера |
| [`docs/ai/`](docs/ai/) | Предметная область, архитектура, API, схема данных и открытые вопросы |
| [`ROADMAP.md`](ROADMAP.md) | Этапы разработки, задачи и их текущее состояние |
| [`AGENTS.md`](AGENTS.md) | Общие инструкции для ИИ-агентов во всём монорепозитории |

Frontend и backend запускаются независимо. Общие правила будущей интеграции задаёт API-контракт Django: он владеет OpenAPI-схемой, из которой frontend будет генерировать TypeScript-типы по мере появления прикладных endpoints.

## Технологии

Уже подключены:

- backend: Python 3.13, Django 6.1.1, Django REST Framework, PostgreSQL, Psycopg 3, `django-environ` и `drf-spectacular`;
- frontend: Node.js 24 LTS, Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, Pinia и Nuxt UI;
- проверки backend: pytest, pytest-django и Ruff;
- проверки frontend: ESLint, Nuxt typecheck и Vitest с Nuxt Test Utils, Vue Test Utils и Happy DOM; постоянные тесты добавляются вместе с функциями.

Будут подключены тогда, когда появится использующая их функциональность:

- Celery и Redis — для фоновых задач;
- `django-storages` и S3-совместимое хранилище — для закрытых файлов;
- Playwright — для сквозных пользовательских сценариев.

## Требования

- Python 3.13;
- Node.js 24 LTS и npm;
- Docker Desktop с Docker Compose — для PostgreSQL.

## Первый запуск

Команды ниже выполняются из корня репозитория, если в тексте не указан другой каталог.

### 1. Подготовить переменные окружения

```powershell
Copy-Item backend/.env.example backend/.env
```

На macOS/Linux:

```shell
cp backend/.env.example backend/.env
```

| Переменная | Назначение |
| --- | --- |
| `SECRET_KEY` | Секрет Django для криптографической подписи. В production нужен длинный случайный ключ. |
| `DEBUG` | Режим отладки. В production должен быть `False`. |
| `ALLOWED_HOSTS` | Разрешённые host-заголовки через запятую. |
| `POSTGRES_DB` | Имя базы, которую создаёт контейнер и к которой подключается Django. |
| `POSTGRES_USER` | Пользователь PostgreSQL. |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL. |
| `POSTGRES_HOST` | Адрес базы для Django. |
| `POSTGRES_PORT` | Локальный порт PostgreSQL. |

### 2. Подготовить Python-окружение backend

Перейдите в каталог backend:

```shell
cd backend
```

Если вы используете venv, создайте и активируйте его в PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
```

На macOS/Linux:

```shell
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

Файл `requirements-dev.txt` включает runtime-зависимости из `requirements.txt` и инструменты разработки; Conda устанавливает этот же набор через `environment.yml`.

### 3. Запустить PostgreSQL

```shell
docker compose --env-file backend/.env up -d --wait postgres
docker compose --env-file backend/.env ps
```

### 4. Выполнить миграции и запустить backend

Перейдите в `backend/`, активируйте подготовленное окружение и выполните:

```shell
python manage.py check
python manage.py migrate
python manage.py runserver
```

После запуска доступны:

- Django — `http://127.0.0.1:8000`;
- OpenAPI — `http://127.0.0.1:8000/api/schema/`;
- Swagger UI — `http://127.0.0.1:8000/api/docs/`.


### 5. Установить и запустить frontend

Откройте второй терминал из корня репозитория:

Создайте `frontend/.env` по `frontend/.env.example`; адрес Django задаётся через `NUXT_BACKEND_ORIGIN`. Настройка прокси и примеры запросов — в [инструкции API](frontend/docs/API.md).

```shell
cd frontend
npm install
npm run dev
```

Nuxt выведет локальный адрес, обычно `http://localhost:3000`. Backend и PostgreSQL при этом продолжают работать в своих процессах.
## Проверки

Из `backend/`, с активированным Python-окружением и доступной PostgreSQL для тестов:

```shell
python -m ruff check .
python -m ruff format --check .
python -m pytest
```

Из `frontend/`:

```shell
npm run lint
npm run typecheck
npm test
npm run build
```

Расположение тестов, `test:watch`, пример и очистка состояния описаны в [инструкции тестирования frontend](frontend/docs/TESTING.md). Проверка автономного прототипа описана в его [README](static-prototype/README.md).

## Git hooks перед push или commit

Hooks хранятся в `.githooks/` и передаются вместе с репозиторием. В каждом новом клоне включите их один раз из корня проекта:

```shell
git config --local core.hooksPath .githooks
```

Настройка действует только в текущем клоне. Перед командами Git активируйте Python-окружение backend. Для запуска hooks из IDE можно сохранить путь к выбранному Python в локальной конфигурации Git:

```powershell
git config --local nortland.backendPython (python -c "import sys; print(sys.executable)")
```

На macOS/Linux:

```shell
git config --local nortland.backendPython "$(python -c 'import sys; print(sys.executable)')"
```

Перед коммитом запускаются проверки только для изменённой части проекта: для backend — Ruff и pytest, для frontend — ESLint и Vitest. Frontend-hook применяет `ESLint --fix` к добавленным в индекс JS, TS и Vue-файлам и снова добавляет исправления в индекс. Если в одном из этих файлов есть изменения вне индекса, hook останавливает коммит: сначала добавьте их в индекс или уберите. Перед push обе части проверяются без автоисправлений, потому что push отправляет уже созданные коммиты. Backend-форматирование только проверяется, поэтому исправление нужно запускать явно через `python -m ruff format .`.

Если в рабочей папке есть незакоммиченные изменения, hook предупреждает, что проверяет текущие файлы, хотя Git сохраняет или отправляет другую версию. Если PostgreSQL выключен, тесты с `django_db` пропускаются с явным предупреждением — это означает, что логика работы с БД не проверена.

## Документация проекта и инструкции для ИИ

Основные документы:

- [`ROADMAP.md`](ROADMAP.md) — порядок этапов и задач;
- [`docs/ai/README.md`](docs/ai/README.md) — навигация по документации;
- [`docs/ai/STACK.md`](docs/ai/STACK.md) — утверждённый стек;
- [`docs/ai/DOMAIN.md`](docs/ai/DOMAIN.md) — предметная область и бизнес-правила;
- [`docs/ai/API.md`](docs/ai/API.md) — договорённости REST/OpenAPI;
- [`docs/ai/MODULES.md`](docs/ai/MODULES.md) — границы модулей M1–M8;
- [`docs/ai/OPEN_QUESTIONS.md`](docs/ai/OPEN_QUESTIONS.md) — решения, которые нельзя додумывать;
- [`docs/ai/schema.json`](docs/ai/schema.json) — логическая модель хранения, а не готовые Django models;
- [`docs/ai/CHECKS.md`](docs/ai/CHECKS.md) — ожидаемые проверки.

ИИ-агент, работающий из корня, начинает с [`AGENTS.md`](AGENTS.md), а затем читает только документы, связанные с текущей задачей. Для независимой работы в двух IDE используются:

- backend: [`backend/AGENTS.md`](backend/AGENTS.md) и [`backend/docs/ai/CONTEXT.md`](backend/docs/ai/CONTEXT.md);
- frontend: [`frontend/AGENTS.md`](frontend/AGENTS.md) и [`frontend/docs/ai/CONTEXT.md`](frontend/docs/ai/CONTEXT.md).

При изменении бизнес-правил нужно обновлять `DOMAIN.md`; при изменении API — OpenAPI, frontend-клиент и тесты; при изменении хранения — Django migrations и `schema.json`.
