<script setup lang="ts">
  import { computed } from 'vue'

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
    <div class="onboarding-step-intro__icon-wrapper">
      <span class="material-symbols-outlined onboarding-step-intro__icon">
        {{ icon }}
      </span>
    </div>
    <div class="onboarding-step-intro__content">
      <h1 :class="['onboarding-step-intro__title', titleClass]">{{ title }}</h1>
      <div class="onboarding-step-intro__description-wrapper">
        <p class="onboarding-step-intro__description">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .onboarding-step-intro {
    @apply mt-8 flex flex-col justify-center gap-2 text-center;
  }

  .onboarding-step-intro__icon-wrapper {
    @apply flex justify-center;
  }

  .onboarding-step-intro__icon {
    @apply w-fit rounded-full bg-primary-100 p-4 text-6xl text-primary-500;
  }

  .onboarding-step-intro__content {
    @apply flex flex-col justify-center;
  }

  .onboarding-step-intro__title {
    @apply text-4xl font-bold;
  }

  .onboarding-step-intro__title--highlighted {
    @apply text-primary-600;
  }

  .onboarding-step-intro__description-wrapper {
    @apply flex justify-center text-lg text-gray-600;
  }

  .onboarding-step-intro__description {
    @apply w-[500px];
  }
</style>
