<!--
  SectionCard — molecule
  Reusable dashboard section container: optional titled header with a
  right-side #action slot, a default body slot, and an optional #footer slot.
-->

<script setup lang="ts">
  import { Heading } from '@/components/atoms'
  import type { SectionCardProps } from '@/components/molecules'

  withDefaults(defineProps<SectionCardProps>(), {
    as: 'div',
    title: undefined
  })
</script>

<template>
  <component :is="as" class="section-card">
    <!-- Header — only rendered when title or #action slot has content -->
    <div v-if="title || $slots.action" class="section-card__header">
      <Heading v-if="title" level="h4">{{ title }}</Heading>
      <slot name="action" />
    </div>

    <!-- Body -->
    <slot />

    <!-- Footer -->
    <slot name="footer" />
  </component>
</template>
<style lang="postcss" scoped>
  .section-card {
    @apply flex flex-col rounded-2xl border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800;
  }
  .section-card__header {
    @apply flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700;
  }
</style>
