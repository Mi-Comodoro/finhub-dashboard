<script setup lang="ts">
  // Layout wrapper - no props, no domain logic
</script>

<template>
  <aside class="sidebar-page">
    <slot />
  </aside>
</template>

<style lang="postcss" scoped>
  .sidebar-page {
    @apply flex flex-col gap-6;
  }
</style>
