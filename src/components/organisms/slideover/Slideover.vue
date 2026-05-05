<script setup lang="ts">
  defineProps<{ open: boolean }>()
  defineEmits<{ 'update:open': [value: boolean] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="slideover">
      <div class="slideover__backdrop" @click="$emit('update:open', false)" />
      <div class="slideover__panel">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="postcss">
  .slideover {
    @apply fixed inset-0 z-50;
  }

  .slideover__backdrop {
    @apply absolute inset-0 bg-black/50;
  }

  .slideover__panel {
    @apply absolute inset-y-0 left-0 flex w-64 flex-col overflow-hidden bg-white shadow-xl dark:bg-slate-900;
  }
</style>
