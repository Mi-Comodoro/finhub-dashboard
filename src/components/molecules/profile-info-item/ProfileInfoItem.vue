<script setup lang="ts">
  interface Props {
    label: string
    value?: string | number | null
    fallback?: string
  }

  withDefaults(defineProps<Props>(), {
    value: '',
    fallback: 'No especificado'
  })
</script>

<template>
  <div class="profile-info-item">
    <Text as="span" size="sm" color="muted" class="profile-info-item__label">{{ label }}</Text>
    <slot>
      <Text as="span" size="sm" weight="medium" class="profile-info-item__value">
        {{ value || fallback }}
      </Text>
    </slot>
  </div>
</template>
<style lang="postcss" scoped>
  .profile-info-item {
    @apply flex items-center justify-between gap-4 py-3;
  }
  .profile-info-item__label {
    @apply shrink-0;
  }
  .profile-info-item__value {
    @apply text-right;
  }
</style>
