<script setup lang="ts">
import { ru } from '@nuxt/ui/locale';
import brandLogo from '~/assets/images/logo-simple.png';

const title = 'Нортландия онлайн';
const description = 'Онлайн-школа, где дети открывают мастерские, знакомятся с персонажами и выполняют задания.';
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
  title,
  description,
  ogTitle: title,
  ogDescription: description,
});
</script>

<template>
  <UApp :locale="ru">
    <div class="flex min-h-dvh flex-col bg-page">
      <AppHeader />
      <main class="flex w-full flex-1">
        <NuxtPage />
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>
