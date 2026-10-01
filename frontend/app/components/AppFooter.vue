<template>
  <footer class="border-t border-default bg-default text-sm text-muted">
    <div class="footer-inner">
      <div>
        <p class="font-extrabold text-default">
          Нортландия онлайн
        </p>
        <p>
          © {{ new Date().getFullYear() }}
        </p>
      </div>

      <div class="grid gap-1" aria-label="Контакты">
        <p class="font-extrabold text-default">
          Контакты
        </p>
        <p>
          Телефон: уточняется
        </p>
        <p>
          Электронная почта: уточняется
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-inner {
  display: flex;
  width: min(100%, 1200px);
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-inline: auto;
  padding: 20px 16px;
}

@media (min-width: 768px) {
  .footer-inner {
    padding-inline: 24px;
  }
}

@media (max-width: 479px) {
  .footer-inner {
    flex-direction: column;
  }
}
</style>
