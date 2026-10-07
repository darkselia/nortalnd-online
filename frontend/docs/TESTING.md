# Тесты frontend

Vitest содержит два независимых проекта: Node для клиента API и прокси, Nuxt для поведения в приложении и компонентных проверок. Тесты добавляем вместе с поведением, которое нужно проверять.

Из каталога `frontend/`:

```shell
npm test
npm run test:watch
```

В `tests/unit/api.spec.ts` оставлены две проверки на локальных HTTP-серверах: актуальный CSRF для изменяющих запросов и передача query, тела, cookies, статуса и Set-Cookie через прокси. Они не проверяют вход Django.

Для будущих компонентных тестов подготовлено `tests/nuxt/**/*.spec.ts` с окружением Nuxt и Happy DOM; постоянных компонентных тестов пока нет. В тестовом окружении отключена загрузка внешних шрифтов Nuxt UI. Флаг `--passWithNoTests` допускает отсутствие файлов в отдельном проекте.

Для отдельного проекта: `npm test -- --project unit` или `npm test -- --project nuxt`. Использование клиента описано в [API.md](API.md).

## Первый тест

Например, файл `tests/nuxt/header.spec.ts` можно начать так:

```ts
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { UApp } from '#components';
import { defineComponent, h } from 'vue';
import { expect, it } from 'vitest';
import AppHeader from '../../app/components/AppHeader.vue';

const Shell = defineComponent({
  setup: () => () => h(UApp, null, { default: () => h(AppHeader) }),
});

it('renders the header', async() => {
  const wrapper = await mountSuspended(Shell);

  expect(wrapper.find('header').exists()).toBe(true);
});
```

Это пример монтирования, а не постоянный тест проекта. Для формы замените компонент и добавьте ожидания её поведения: ошибки, состояние загрузки или блокировку повторной отправки. Обычные компоненты монтируйте напрямую через `mountSuspended(Component)`; оболочка `UApp` нужна, если используются предоставляемые ею возможности Nuxt UI.

## Очистка и ограничения

- Общий `tests/setup.ts` автоматически размонтирует компоненты после каждого теста и восстанавливает spies через `vi.restoreAllMocks()`.
- Изменённые тестом тему, cookies, storage, fake timers и другое общее состояние восстанавливайте в его `afterEach`. Историю вызовов собственных `vi.fn()` также очищайте явно при повторном использовании.
- Используйте реальные Nuxt UI-компоненты. Подменяйте внешние запросы и отсутствующие браузерные API только по необходимости; не создавайте общий набор моков заранее.
- Happy DOM позволяет проверять структуру и поведение. Внешний вид, CSS из `theme.css`, адаптивность и гидратацию проверяем в настоящем браузере.
