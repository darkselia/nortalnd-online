<script setup lang="ts">
import schoolIllustration from '~/assets/images/title.jpg';
</script>

<template>
  <section class="landing" aria-labelledby="landing-title">
    <div class="grid justify-items-start gap-5">
      <p class="text-xs font-extrabold tracking-[0.08em] text-muted uppercase">
        Онлайн-школа для детей
      </p>
      <h1 id="landing-title" class="landing-title">
        Добро пожаловать в Нортландию
      </h1>
      <p class="landing-description text-muted">
        Здесь дети открывают мастерские, знакомятся с персонажами и выполняют задания.
        Нортландия онлайн готовится к первым путешествиям.
      </p>
      <div class="grid justify-items-start gap-2">
        <UButton size="xl" disabled aria-describedby="landing-login-status">
          Войти
        </UButton>
        <p id="landing-login-status" class="text-sm text-muted">
          Вход станет доступен позже.
        </p>
      </div>
    </div>

    <img
      :src="schoolIllustration"
      class="landing-picture rounded-picture shadow-card"
      alt="Иллюстрированная площадь онлайн-школы Нортландия"
      width="1024"
      height="768"
    >
  </section>
</template>

<style scoped>
.landing {
  display: grid;
  width: min(100%, 1200px);
  align-items: center;
  gap: 24px;
  margin: auto;
  padding: 32px 16px;
}

.landing-title {
  max-width: 14ch;
  font-size: clamp(2rem, 7vw, 4.5rem);
  font-weight: 900;
  line-height: 1.1;
}

.landing-description {
  max-width: 55ch;
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.55;
}

.landing-picture {
  width: 100%;
  max-width: 590px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: center 65%;
  border: 8px solid var(--ui-bg);
}

@media (min-width: 768px) {
  .landing {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 32px;
    padding: 56px 24px;
  }
}
</style>
