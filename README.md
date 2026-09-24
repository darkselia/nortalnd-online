# Нортландия онлайн

«Нортландия онлайн» — образовательная игровая платформа для детской школы. Дети выбирают мастерские, общаются с персонажами, берут и выполняют задания, получают токены, репутацию и достижения. Родители и сотрудники работают через отдельные кабинеты, а права, переходы статусов и начисления проверяются на сервере.

Проект находится на раннем этапе разработки. Backend и frontend пока представляют собой технические каркасы, автономный прототип интерфейса находится в `static-prototype/`, а утверждённые правила и границы модулей описаны в `docs/ai/`. Порядок дальнейшей реализации и текущее состояние задач приведены в [`ROADMAP.md`](ROADMAP.md).

## Структура монорепозитория

| Путь | Содержимое |
| --- | --- |
| [`backend/`](backend/) | Django-проект, REST API и серверная бизнес-логика |
| [`frontend/`](frontend/) | Клиентское приложение на Nuxt |
| [`static-prototype/`](static-prototype/) | Автономный HTML/CSS/JavaScript-прототип без сборки и сервера |
| [`docs/ai/`](docs/ai/) | Предметная область, архитектура, API, схема данных и открытые вопросы |
| [`ROADMAP.md`](ROADMAP.md) | Этапы разработки, задачи и их текущее состояние |
| [`AGENTS.md`](AGENTS.md) | Общие инструкции для ИИ-агентов во всём монорепозитории |

Frontend и backend запускаются независимо, но используют общий API-контракт. Django владеет OpenAPI-схемой, а frontend должен генерировать из неё TypeScript-типы и не редактировать generated-файлы вручную.

## Технологии

Уже подключены:

- backend: Python 3.13, Django 6.1.1, Django REST Framework, PostgreSQL, Psycopg 3, `django-environ` и `drf-spectacular`;
- frontend: Node.js 24 LTS, Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, Pinia и Nuxt UI;
- проверки backend: pytest, pytest-django и Ruff;
- проверки frontend: ESLint, Nuxt typecheck и Vitest.

Будут подключены тогда, когда появится использующая их функциональность:

- Celery и Redis — для фоновых задач;
- `django-storages` и S3-совместимое хранилище — для закрытых файлов;
- Playwright — для сквозных пользовательских сценариев.

## Требования

- Python 3.13;
- Node.js 24 LTS и npm;
- Docker Desktop с Docker Compose — только для PostgreSQL.

## Первый запуск

Команды ниже выполняются из корня репозитория, если в тексте не указан другой каталог.

### 1. Подготовить переменные окружения

Django и Docker Compose читают настройки из локального файла `backend/.env`. Создайте его из версионируемого шаблона:

```powershell
Copy-Item backend/.env.example backend/.env
```

На macOS/Linux:

```shell
cp backend/.env.example backend/.env
```

| Переменная          | Назначение                                                                              |
| ------------------- | --------------------------------------------------------------------------------------- |
| `SECRET_KEY`        | Секрет Django для криптографической подписи. В production нужен длинный случайный ключ. |
| `DEBUG`             | Режим отладки. В production должен быть `False`.                                        |
| `ALLOWED_HOSTS`     | Разрешённые host-заголовки через запятую.                                               |
| `POSTGRES_DB`       | Имя базы, которую создаёт контейнер и к которой подключается Django.                    |
| `POSTGRES_USER`     | Пользователь PostgreSQL.                                                                |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL. Замените пример до первого запуска контейнера.                       |
| `POSTGRES_HOST`     | Адрес базы для Django. При локальном Docker используется `127.0.0.1`.                   |
| `POSTGRES_PORT`     | Локальный порт PostgreSQL. По умолчанию `5432`.                                         |

Имя базы, пользователь и пароль применяются при первом создании volume. Их последующее изменение в `.env` не меняет уже существующего пользователя PostgreSQL автоматически. Если нужно пересоздать локальную базу, сначала убедитесь, что в ней нет данных, которые требуется сохранить.

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

Если вы используете Conda:

```shell
conda env create -f environment.yml
conda activate nortland-backend
```

 Файл `requirements-dev.txt` включает runtime-зависимости из `requirements.txt` и инструменты разработки. Для production устанавливается только `requirements.txt`.

### 3. Запустить PostgreSQL

Отдельно устанавливать PostgreSQL в операционную систему не нужно. База запускается в Docker, а Django продолжает работать локально в выбранном Python-окружении:

```shell
docker compose --env-file backend/.env up -d --wait postgres
docker compose --env-file backend/.env ps
```

Compose создаёт базу и пользователя из `backend/.env`, проверяет готовность PostgreSQL и хранит данные в именованном volume `postgres_data`. Порт публикуется только на локальном интерфейсе.

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

Чтобы отдельно подтвердить соединение именно с PostgreSQL, выполните из `backend/`:

```shell
python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print(connection.vendor, connection.settings_dict['NAME'])"
```

Команда должна вывести `postgresql` и имя базы из `.env`. Один `manage.py check` наличие соединения с БД не подтверждает.

### 5. Установить и запустить frontend

Откройте второй терминал из корня репозитория:

```shell
cd frontend
npm install
npm run dev
```

Nuxt выведет локальный адрес, обычно `http://localhost:3000`. Backend и PostgreSQL при этом продолжают работать в своих процессах.

## Ежедневный запуск разработки

После первоначальной настройки обычно нужны три процесса:

1. PostgreSQL из корня репозитория:

   ```shell
   docker compose --env-file backend/.env up -d --wait postgres
   ```

2. Django из `backend/` с активированным окружением:

   ```shell
   python manage.py runserver
   ```

3. Nuxt из `frontend/`:

   ```shell
   npm run dev
   ```

Остановить PostgreSQL без удаления данных можно командой:

```shell
docker compose --env-file backend/.env stop postgres
```

Повторно запустить остановленный контейнер можно через `start postgres`. Команда `down` удаляет контейнер и сеть, но сохраняет данные в именованном volume.


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

Если путь не задан, hooks используют `python` из активного окружения.

Перед коммитом запускаются проверки только для изменённой части проекта: для backend — Ruff и pytest, для frontend — ESLint и Vitest. Перед push проверяются обе части. Frontend-hook может автоматически исправить добавленные в индекс файлы ESLint; backend-форматирование только проверяется, поэтому исправление нужно запускать явно через `python -m ruff format .`.

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
