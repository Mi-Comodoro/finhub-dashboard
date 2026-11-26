<script setup lang="ts"></script>
<template>
  <div class="container-block">
    <div class="container-block__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .container-block {
    @apply mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8;
  }

  .container-block__content {
    @apply flex flex-col gap-6;
  }
</style>
