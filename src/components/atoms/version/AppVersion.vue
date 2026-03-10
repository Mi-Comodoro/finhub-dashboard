<script setup lang="ts">
  interface AppVersionProps {
    /** Show version prefix */
    showPrefix?: boolean
    /** Custom classes */
    className?: string
    /** Size variant */
    size?: 'xs' | 'sm' | 'md'
  }

  const props = withDefaults(defineProps<AppVersionProps>(), {
    showPrefix: true,
    className: '',
    size: 'sm'
  })

  // Version from package.json or environment
  const appVersion = '1.0.0'

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base'
  }

  const displayVersion = computed(() => (props.showPrefix ? `v.${appVersion}` : appVersion))
</script>

<template>
  <span :class="['font-normal text-gray-500 dark:text-gray-400', sizeClasses[size], className]">
    {{ displayVersion }}
  </span>
</template>
