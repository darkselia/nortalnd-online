# Нортландия онлайн

«Нортландия онлайн» — монорепозиторий образовательной игровой платформы для детской школы. В продукте дети выбирают мастерские, общаются с персонажами, берут и выполняют задания, получают теги, токены и репутацию. Родители и сотрудники работают через отдельные кабинеты с серверной проверкой прав.

Проект находится на раннем этапе разработки: frontend и backend пока содержат стартовые каркасы, а автономный интерактивный прототип уже доступен в `static-prototype/`. Утверждённые бизнес-правила и границы модулей зафиксированы в `docs/ai/`.

## Структура монорепозитория

| Путь | Содержимое |
| --- | --- |
| [`frontend/`](frontend/) | Клиентское приложение на Nuxt |
| [`backend/`](backend/) | Django-проект, будущий REST API и серверная бизнес-логика |
| [`static-prototype/`](static-prototype/) | Автономный HTML/CSS/JavaScript-прототип без сборки |
| [`docs/ai/`](docs/ai/) | Предметная область, архитектура, API, схема данных и открытые вопросы |
| [`AGENTS.md`](AGENTS.md) | Общие инструкции для ИИ-агентов во всём монорепозитории |


## Стек

### Frontend

- Node.js 24 LTS;
- Nuxt 4 и Vue 3;
- TypeScript;
- Tailwind CSS 4 и Nuxt UI;
- Pinia;
- ESLint и проверка типов через `vue-tsc`/Nuxt.

### Backend

- Python 3.13;
- Django 6.1.1;
- Django REST Framework;
- PostgreSQL и Psycopg 3;
- `django-environ` для конфигурации;
- `drf-spectacular` для будущей OpenAPI-схемы;
- Celery и Redis для фоновых задач;
- `django-storages` и S3-совместимое хранилище для закрытых файлов.


## Требования

- Python 3.13;
- Node.js 24 LTS и npm;
- Docker Desktop с Docker Compose для PostgreSQL 16;

Frontend и backend запускаются независимо. Удобно открыть два терминала из корня репозитория.

## Запуск frontend

```shell
cd frontend
npm install
npm run dev
```

После запуска Nuxt выведет локальный адрес, обычно `http://localhost:3000`.

Дополнительные команды:

```shell
npm run lint       # проверка ESLint
npm run typecheck  # проверка TypeScript
npm run build      # production-сборка
npm run preview    # просмотр production-сборки
```

## Запуск PostgreSQL в Docker

Устанавливать PostgreSQL в Windows, macOS или Linux отдельно не нужно. Docker Compose скачивает официальный образ PostgreSQL 16, создаёт пользователя и базу из `backend/.env`, проверяет готовность сервера и сохраняет данные в именованном volume `postgres_data`.

При первом запуске скопируйте пример настроек из корня репозитория:

```powershell
Copy-Item backend/.env.example backend/.env
```

На macOS/Linux:

```shell
cp backend/.env.example backend/.env
```

Задайте локальный пароль в `POSTGRES_PASSWORD`, затем запустите базу:

```shell
docker compose --env-file backend/.env up -d --wait postgres
docker compose --env-file backend/.env ps
```

Параметр `--env-file backend/.env` нужен Docker Compose для чтения настроек PostgreSQL. Compose передаёт контейнеру только `POSTGRES_DB`, `POSTGRES_USER` и `POSTGRES_PASSWORD`; Django `SECRET_KEY` в контейнер базы не попадает.

Compose публикует PostgreSQL только на локальном интерфейсе `127.0.0.1:5432`. Остановить базу можно командой `docker compose --env-file backend/.env stop postgres`, снова запустить — `docker compose --env-file backend/.env start postgres`. Команда `docker compose --env-file backend/.env down` удаляет контейнер и сеть, но сохраняет данные в volume.

Имя базы, пользователь и пароль применяются при первом создании volume. Последующее редактирование этих трёх значений в `.env` не меняет уже созданного пользователя PostgreSQL автоматически.

Настройки Django и контейнера берутся из одного файла:

```dotenv
DB_ENGINE=postgresql
POSTGRES_DB=nortland
POSTGRES_USER=nortland
POSTGRES_PASSWORD=choose-a-local-password
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
```

Django собирает словарь подключения из этих полей в `settings.py`; URL вручную составлять не нужно. `POSTGRES_DB`, `POSTGRES_USER` и `POSTGRES_PASSWORD` также понимает официальный Docker-образ. `POSTGRES_HOST` остаётся `127.0.0.1`, потому что Django запускается на компьютере, а не внутри Compose.


## Запуск backend

В PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

В macOS или Linux отличается только активация окружения:

```shell
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Django будет доступен по адресу `http://127.0.0.1:8000`, admin — по адресу `http://127.0.0.1:8000/admin/`. Чтобы войти в admin, сначала выполните `python manage.py createsuperuser`.

### Установка backend через Miniconda

Установите [Miniconda](https://docs.conda.io/projects/miniconda/en/latest/) и откройте Anaconda Prompt или терминал, в котором доступна команда `conda`. Файл `backend/environment.yml` создаёт отдельное окружение с Python 3.13 и устанавливает зависимости из `requirements.txt`:

```shell
cd backend
conda env create -f environment.yml
conda activate nortland-backend
```

После запуска PostgreSQL через Docker примените миграции и запустите Django:

```shell
python manage.py migrate
python manage.py runserver
```

После изменения зависимостей окружение можно синхронизировать:

```shell
conda env update -f environment.yml --prune
```

## Переменные окружения backend

Django читает [`backend/.env`](backend/.env) при старте. Этот файл содержит локальные значения и исключён из Git. Версионируемый шаблон находится в [`backend/.env.example`](backend/.env.example). Для нового окружения скопируйте шаблон и заполните значения:

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
| `DB_ENGINE` | Движок базы. Текущая Docker-конфигурация использует `postgresql`. |
| `POSTGRES_DB` | Имя базы, которую создаёт контейнер и к которой подключается Django. |
| `POSTGRES_USER` | Пользователь PostgreSQL. |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL. Замените пример перед первым запуском контейнера. |
| `POSTGRES_HOST` | Адрес базы для Django; при локальном Docker — `127.0.0.1`. |
| `POSTGRES_PORT` | Порт PostgreSQL — `5432`. |

В `.env.example` оставлены только параметры, которые читает текущий Django-каркас, и настройки PostgreSQL. Переменные Redis, Celery, SMTP и S3 будут добавлены, когда соответствующие интеграции появятся в коде. Не коммитьте настоящий `.env`, пароли и ключи доступа.

## Запуск автономного прототипа

Откройте [`static-prototype/index.html`](static-prototype/index.html) двойным щелчком и выберите экран. Для этой части не нужны Node.js, Python, npm или локальный сервер. Подробности приведены в [`static-prototype/README.md`](static-prototype/README.md).

Прототип содержит демонстрационные данные и не обращается к backend.

## Документация для ИИ-агентов

Агент, работающий из корня, начинает с [`AGENTS.md`](AGENTS.md), затем читает навигацию [`docs/ai/README.md`](docs/ai/README.md), стек [`docs/ai/STACK.md`](docs/ai/STACK.md) и предметную область [`docs/ai/DOMAIN.md`](docs/ai/DOMAIN.md).

Для работы только с одной частью есть самостоятельные инструкции:

- backend: [`backend/AGENTS.md`](backend/AGENTS.md) и [`backend/docs/ai/CONTEXT.md`](backend/docs/ai/CONTEXT.md);
- frontend: [`frontend/AGENTS.md`](frontend/AGENTS.md) и [`frontend/docs/ai/CONTEXT.md`](frontend/docs/ai/CONTEXT.md).

Общие документы:

- [`docs/ai/API.md`](docs/ai/API.md) — договорённости REST/OpenAPI;
- [`docs/ai/MODULES.md`](docs/ai/MODULES.md) — границы доменных модулей M1–M8;
- [`docs/ai/OPEN_QUESTIONS.md`](docs/ai/OPEN_QUESTIONS.md) — решения, которые нельзя додумывать;
- [`docs/ai/schema.json`](docs/ai/schema.json) — логическая модель хранения, не готовые Django models;
- [`docs/ai/CHECKS.md`](docs/ai/CHECKS.md) — ожидаемые проверки.

Django владеет API-контрактом и публикует OpenAPI. Frontend должен генерировать типы из схемы и не редактировать generated-файлы вручную.

При изменении бизнес-правил обновляйте `DOMAIN.md`; при изменении API — OpenAPI, клиент и тесты; при изменении хранения — Django migrations и `schema.json`.
