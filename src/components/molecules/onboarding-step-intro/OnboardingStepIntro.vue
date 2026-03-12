<script setup lang="ts">
  import { computed } from 'vue'

  import { Heading, Text } from '@/components/atoms'
  import type { OnboardingStepIntroProps } from '@/components/molecules'

  const props = withDefaults(defineProps<OnboardingStepIntroProps>(), {
    highlightedTitle: false
  })

  const titleClass = computed(() => ({
    'onboarding-step-intro__title--highlighted': props.highlightedTitle
  }))
</script>

<template>
  <div class="onboarding-step-intro">
    <div class="onboarding-step-intro__header">
      <div>
        <Heading
          level="h1"
          size="2xl"
          weight="extrabold"
          :class="['onboarding-step-intro__title', titleClass]"
        >
          {{ title }}
        </Heading>
        <Text size="sm" color="muted" class="onboarding-step-intro__description">
          {{ description }}
        </Text>
      </div>
    </div>
    <div class="onboarding-step-intro__description-wrapper"></div>
  </div>
</template>

<style scoped lang="postcss">
  .onboarding-step-intro {
    @apply flex flex-col items-center gap-4;
  }
  .onboarding-step-intro__header {
    @apply flex w-full items-center gap-4;
  }

  .onboarding-step-intro__title {
    @apply text-2xl font-extrabold;
  }

  .onboarding-step-intro__description-wrapper {
    @apply flex text-sm text-gray-600;
  }
  .onboarding-step-intro__description {
    @apply w-full;
  }
</style>
