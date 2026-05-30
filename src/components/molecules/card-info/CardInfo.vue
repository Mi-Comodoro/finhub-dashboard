<script lang="ts" setup>
  import { computed } from 'vue'

  import Icon from '@/components/atoms/icons/Icon.vue'
  import type { LabelColor, LabelSize } from '@/components/atoms/typography/types/label.types'

  import type { CardInfoProps } from './types/card-info.types'

  const props = withDefaults(defineProps<CardInfoProps>(), {
    verticalSpace: false,
    iconSize: 'md' as 'sm' | 'md' | 'lg'
  })

  if (import.meta.dev && !props.title) {
    console.warn('[CardInfo] "title" prop is required but was not provided')
  }

  const variantStyles = {
    primary: {
      icon: 'bg-primary-900 text-primary-100',
      currency: 'text-primary-600',
      alert: 'text-primary-600',
      bgAccent: 'text-primary-200',
      background: '!bg-white'
    },
    secondary: {
      icon: 'bg-secondary-100 text-secondary-600',
      currency: 'text-secondary-600',
      alert: 'text-secondary-600',
      bgAccent: 'text-secondary-200',
      background: '!bg-white'
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      currency: 'text-amber-600',
      alert: 'text-amber-600',
      bgAccent: 'text-amber-200',
      background: '!bg-white'
    },
    danger: {
      icon: 'bg-red-100 text-red-600',
      currency: 'text-red-600',
      alert: 'text-red-600',
      bgAccent: 'text-red-200',
      background: '!bg-white'
    },
    gold: {
      icon: 'bg-yellow-100 text-yellow-500',
      currency: 'text-yellow-500',
      alert: 'text-yellow-500',
      bgAccent: 'text-yellow-200',
      background: '!bg-white'
    },
    accent: {
      icon: 'text-yellow-300',
      currency: 'text-yellow-300',
      alert: 'text-yellow-500',
      bgAccent: 'text-primary-100',
      background: '!bg-primary-900'
    }
  }
  const fallbackStyles = {
    icon: '',
    currency: 'text-neutral-400',
    alert: 'text-neutral-400',
    bgAccent: 'text-neutral-200',
    background: ''
  }

  const styles = computed(() => {
    const variantKey = props.iconVariant as keyof typeof variantStyles

    const isCustom = props.iconVariant === 'custom'

    const baseStyles =
      !isCustom && variantStyles[variantKey] ? variantStyles[variantKey] : fallbackStyles

    // 👇 si es custom SOLO usa dinámicas
    const iconClasses = isCustom ? [props.iconBgClass, props.iconTextClass] : [baseStyles.icon]

    return {
      ...baseStyles,
      icon: iconClasses.filter(Boolean).join(' ')
    }
  })
</script>

<template>
  <div class="card-info">
    <div class="card-info__header">
      <!-- Se restauró :class-name para asegurar la compatibilidad con tu átomo Icon -->
      <Icon
        v-if="icon"
        :name="icon"
        size="2xl"
        :class-name="['rounded-md', 'p-2', styles.icon].join(' ')"
      />
      <div :class="verticalSpace ? 'flex flex-col space-y-2' : 'flex flex-col'">
        <Heading :level="level" :size="titleSize" :weight="weight" :color="color">
          {{ title }}
        </Heading>
        <Text
          v-if="subTitle && !subTitleVariant"
          :size="subTitleSize"
          :color="subTitleColor"
          :weight="subTitleWeight"
        >
          {{ subTitle }}
        </Text>
        <Label
          v-else-if="subTitle && subTitleVariant"
          :size="subTitleSize as LabelSize"
          :variant="subTitleVariant"
          :color="subTitleColor as LabelColor"
        >
          {{ subTitle }}
        </Label>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .card-info {
    @apply flex flex-col;
  }
  .card-info__header {
    @apply flex items-center gap-2;
  }
</style>
