<script setup lang="ts">
  import * as Flags from 'country-flag-icons/string/3x2'
  import { computed } from 'vue'

  const props = defineProps<{
    countryCode: string
    size?: string | number
    rounded?: boolean
  }>()

  const flagSvg = computed(() => {
    const code: string = props.countryCode.toUpperCase()
    const flagComponent = (Flags as Record<string, string>)[code]
    if (!flagComponent) {
      console.warn(`Flag not found for country code: ${code}`)
      return ''
    }
    return flagComponent
  })

  const flagStyle = computed(() => ({
    width: typeof props.size === 'number' ? `${props.size}px` : props.size || '1em',
    height: typeof props.size === 'number' ? `${props.size}px` : props.size || '1em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  }))
</script>

<template>
  <span
    :style="flagStyle"
    class="country-flag"
    :class="{ 'country-flag--rounded': rounded }"
    v-html="flagSvg"
  />
</template>

<style scoped>
  .country-flag {
    display: inline-flex;
    line-height: 1;
    flex-shrink: 0;
  }

  .country-flag :deep(svg) {
    width: 100% !important;
    height: 100% !important;
    vertical-align: middle;
    object-fit: contain;
  }

  .country-flag--rounded :deep(svg) {
    border-radius: 50%;
  }
</style>
