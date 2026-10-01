<script setup lang="ts">
import brandLogo from '~/assets/images/logo-simple.png';

const colorMode = useColorMode();
const themeLabel = computed(() => colorMode.value === 'dark'
  ? 'Включить светлую тему'
  : 'Включить тёмную тему');
</script>

<template>
  <header class="border-b border-default bg-default">
    <div class="header-inner">
      <NuxtLink
        to="/"
        class="inline-flex min-w-0 items-center gap-3 font-black text-default"
        aria-label="Нортландия онлайн — главная"
      >
        <img
          :src="brandLogo"
          alt=""
          class="size-10 shrink-0 object-contain"
          width="40"
          height="40"
        >
        <span class="brand-name">Нортландия онлайн</span>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <ClientOnly>
          <UColorModeButton :aria-label="themeLabel" />
          <template #fallback>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-sun"
              aria-label="Переключение темы загружается"
              disabled
            />
          </template>
        </ClientOnly>
        <span id="header-login-status" class="text-sm text-muted">Скоро</span>
        <UButton aria-describedby="header-login-status" disabled>
          Войти
        </UButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-inner {
  display: flex;
  width: min(100%, 1200px);
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-inline: auto;
  padding: 12px 16px;
}

@media (min-width: 768px) {
  .header-inner {
    min-height: 68px;
    padding-inline: 24px;
  }
}

@media (max-width: 479px) {
  .header-inner {
    flex-wrap: wrap;
  }

  .brand-name {
    display: none;
  }
}
</style>
