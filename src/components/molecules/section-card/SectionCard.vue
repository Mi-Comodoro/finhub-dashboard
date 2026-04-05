<!--
  SectionCard — molecule
  Reusable dashboard section container: optional titled header with a
  right-side #action slot, a default body slot, and an optional #footer slot.
-->

<script setup lang="ts">
  import type { SectionCardProps } from './types'

  const props = withDefaults(defineProps<SectionCardProps>(), {
    as: 'div',
    title: undefined,
    bg: 'white',
    className: ''
  })
  const bgClassName = {
    primary: 'bg-slate-900',
    secondary: '!bg-secondary-600',
    muted: 'bg-slate-500 dark:bg-slate-400',
    accent: 'bg-teal-600 dark:bg-teal-400',
    success: 'bg-green-600 dark:bg-green-400',
    warning: 'bg-yellow-600 dark:bg-yellow-400',
    error: 'bg-red-600 dark:bg-red-400',
    white: 'bg-white',
    black: 'bg-black'
  }
  const computedClasses = computed(() =>
    ['font-sans', bgClassName[props.bg], props.uppercase ? 'uppercase' : '', props.className]
      .filter(Boolean)
      .join(' ')
  )
</script>

<template>
  <component :is="as" class="section-card" :class="computedClasses">
    <!-- Header — only rendered when title or #action slot has content -->
    <div v-if="title || $slots.action" class="section-card__header">
      <CardInfo
        v-if="title"
        level="h4"
        :title="title"
        :sub-title="subTitle"
        sub-title-size="xs"
        weight="extrabold"
        :icon="icon"
        :color="textColor"
        :icon-variant="iconVariant"
      />
      <slot name="action" />
    </div>

    <!-- Body -->
    <div class="section-card__body">
      <slot />
    </div>
    <!-- Footer -->
    <div v-if="$slots.footer" class="section-card__footer">
      <slot name="footer" />
    </div>
  </component>
</template>
<style lang="postcss" scoped>
  .section-card {
    @apply flex flex-col rounded-md border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800;
  }
  .section-card__header {
    @apply flex items-center justify-between p-4 dark:border-slate-700;
  }
  .section-card__body {
    @apply flex h-full flex-col space-y-2 p-4;
  }
  .section-card__footer {
    @apply flex items-center justify-between p-4 dark:border-slate-700;
  }
</style>
