<script setup lang="ts">
  import type { OnboardingStepIntroProps } from './types'

  withDefaults(defineProps<OnboardingStepIntroProps>(), {})
</script>

<template>
  <div class="onboarding-step-intro">
    <div class="onboarding-step-intro__header">
      <CardInfo
        :title="title"
        :sub-title="description"
        :level="'h1'"
        color="black"
        :title-size="'2xl'"
        :weight="'extrabold'"
        :sub-title-color="'muted'"
        :sub-title-size="'sm'"
      />
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
    @apply flex text-sm text-neutral-600;
  }
  .onboarding-step-intro__description {
    @apply w-full;
  }
</style>
