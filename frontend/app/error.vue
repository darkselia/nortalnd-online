<script setup lang="ts">
import type { NuxtError } from '#app';
import { ru } from '@nuxt/ui/locale';
import brandLogo from '~/assets/images/logo-simple.png';

defineOptions({ name: 'AppErrorPage' });

const props = defineProps<{ error: NuxtError }>();
const status = computed(() => props.error.status ?? props.error.statusCode ?? 500);
const isNotFound = computed(() => status.value === 404);
const title = computed(() => isNotFound.value
  ? 'Страница не найдена'
  : 'Не удалось открыть страницу');
const description = computed(() => isNotFound.value
  ? 'Возможно, адрес изменился или страница ещё не существует'
  : 'Попробуйте вернуться на главную и открыть страницу ещё раз');
const colorMode = useColorMode();
const themeColor = ref<string>();

onMounted(() => {
  watch(() => colorMode.value, () => {
    themeColor.value = getComputedStyle(document.documentElement)
      .getPropertyValue('--nl-page-bg')
      .trim();
  }, { immediate: true, flush: 'post' });
});

useHead(() => ({
  htmlAttrs: { lang: 'ru' },
  meta: themeColor.value ? [{ name: 'theme-color', content: themeColor.value }] : [],
  link: [{ rel: 'icon', type: 'image/png', href: brandLogo }],
}));

useSeoMeta({
  title: () => `${title.value} — Нортландия онлайн`,
  description: () => description.value,
  robots: 'noindex, nofollow',
});

async function goHome() {
  await clearError({ redirect: '/' });
}
</script>

<template>
  <UApp :locale="ru">
    <div class="flex min-h-dvh flex-col bg-page">
      <AppHeader />
      <main class="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <section
          class="w-full max-w-2xl rounded-card border border-default bg-default p-6 text-center shadow-card sm:p-10"
          aria-labelledby="error-title"
        >
          <p class="text-6xl font-black text-muted sm:text-8xl">
            {{ status }}
          </p>
          <h1 id="error-title" class="mt-4 text-2xl font-extrabold text-highlighted sm:text-3xl">
            {{ title }}
          </h1>
          <p class="mt-4 text-base text-muted sm:text-lg">
            {{ description }}
          </p>
          <UButton class="mt-8" size="lg" @click="goHome">
            На главную
          </UButton>
        </section>
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>
