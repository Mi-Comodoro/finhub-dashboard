<template>
  <div class="responsive-container">
    <slot />
  </div>
</template>

<style scoped lang="postcss">
  .responsive-container {
    @apply w-full min-w-0 overflow-hidden;
  }
</style>
