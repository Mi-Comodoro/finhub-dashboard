<script setup lang="ts">
  import { Icon } from '@/components/atoms'

  interface Props {
    icon: string
    containerClass?: string
    iconClass?: string
    size?: string
  }

  withDefaults(defineProps<Props>(), {
    containerClass: '',
    iconClass: '',
    size: 'md'
  })
</script>

<template>
  <div :class="['icon-chip', containerClass]">
    <Icon :name="icon" :size="size" :class="iconClass" />
  </div>
</template>

<style lang="postcss" scoped>
  .icon-chip {
    @apply rounded-lg p-2;
  }
</style>
