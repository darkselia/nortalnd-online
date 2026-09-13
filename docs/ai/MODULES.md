# Карта модулей

Поля таблиц приведены в [schema.json](schema.json). Идентификаторы M1–M8 задают общие границы frontend и backend.

| Модуль | Таблицы | Зона фронтенда | Ответственность бэкенда |
| --- | --- | --- | --- |
| M1 Пользователи и приём | accounts, parent_profiles, children, parent_children, child_onboarding, consents, organizations, cohorts, access_applications | Вход, заявка, онбординг, семья и кабинет организатора | Учётные записи, связи, группы, заявки, согласия |
| M2 Персонал и права | staff_profiles, roles, permissions, staff_roles, role_permissions | Доступные действия и управление персоналом | Проверка полномочий, областей и сроков назначений |
| M3 Мастерские и диалоги | workshops, workshop_categories, characters, task_lines, workshop_labels, dialogue_nodes, dialogue_node_types, conditional_dialogue_nodes, condition_types, dialogue_response_types | Каталог, карточка мастерской, сцена диалога | Контент линий, допустимые узлы, условия и персонажи |
| M4 Банк заданий | tasks, task_variants, task_dialogues, task_materials, task_labels, task_reference_answers, task_rewards | Конструктор, согласования, карточка задания | Шаблоны, варианты, готовность и публикация, настройки наград |
| M5 Выполнение и общение | child_tasks, task_submissions, submission_media, task_messages, child_workshops | Мои задания, отправка, доработка, чат, очередь проверки | Экземпляры, попытки, проверка, участие в мастерской и сведения о сертификате |
| M6 Экономика и прогресс | accruals, accrual_types, accrual_sources, child_characters, child_characteristics, items, child_items | Бейдж, характеристики и история | Начисления и производные балансы; items/child_items предварительны |
| M7 Общие ресурсы | media, labels | Загрузки, просмотр файлов и выбор меток | Метаданные медиа, доступ к файлам, справочник меток |
| M8 Подписки, предварительно | subscription_plans, subscriptions, subscription_children | Будущий платёжный интерфейс | Будущие тарифы и оплаченный доступ; модель не финализирована |

## Границы и совместные сценарии

- M1 хранит Account, M2 расширяет его профилем сотрудника. M2 проверяет доступ к объектам всех модулей.
- M3 владеет структурой линий. M4 использует её при создании заданий; M5 использует опубликованный шаблон при взятии.
- M5 принимает результат работы; M6 выполняет начисление в согласованной транзакционной операции. Сведения о сертификате размещены в child_workshops, хотя условие выдачи зависит от экономики.
- Первое знакомство — сценарий M3, а запись child_characters физически относится к M6. Не создавать вторую независимую таблицу знакомства.
- M7 обслуживает файлы нескольких модулей. submission_media принадлежит M5, task_materials — M4; владение связью не означает открытый доступ к файлу.
- M8 не заменяет parent_children и не удаляет children при истечении подписки.

## Где искать подробности

| Область | Разделы основного проекта |
| --- | --- |
| M1–M2 | [DOMAIN.md](DOMAIN.md): доступ, пользователи и сотрудники; [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) |
| M3 | [DOMAIN.md](DOMAIN.md): мастерские и диалоги |
| M4 | [DOMAIN.md](DOMAIN.md): задания и публикация; [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) |
| M5 | [DOMAIN.md](DOMAIN.md): выполнение, проверка и чат |
| M6 | [DOMAIN.md](DOMAIN.md): экономика и прогресс |
| M7 | [BACKEND.md](BACKEND.md): файлы и доступ; [API.md](API.md) |
| M8 | [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md): предварительная модель подписок |

Это карта ответственности. Корневые папки `frontend/` и `backend/` уже созданы, но доменные подпапки и Django apps должны появляться вместе с реальными вертикальными сценариями. Не создавать восемь пустых приложений только ради соответствия M1–M8 и не считать модуль отдельным сервисом.
