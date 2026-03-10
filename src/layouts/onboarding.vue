<script setup lang="ts">
  // Login layout - minimal layout for authentication pages
</script>

<template>
  <div class="onboarding-layout">
    <slot />
  </div>
</template>

<style scoped>
  .onboarding-layout {
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }
</style>
