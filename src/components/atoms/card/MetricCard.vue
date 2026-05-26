<script setup lang="ts">
  import { computed } from 'vue'

  import Icon from '@/components/atoms/icons/Icon.vue'
  import IconBadge from '@/components/atoms/icons/IconBadge.vue'
  import type { MetricCardProps } from '@/components/atoms/types/atoms.types'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { type Currency, formatCurrency, formatNumber } from '@/utils/currency'

  const props = withDefaults(defineProps<MetricCardProps>(), {
    percentage: undefined,
    percentageText: '',
    icon: undefined,
    variant: 'neutral',
    size: 'md',
    currency: true,
    currencyCode: 'COP',
    decimals: undefined,
    className: '',
    iconClass: undefined,
    subtitle: undefined
  })

  const variantClasses = {
    income: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    expense: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    available: 'bg-gradient-to-br from-teal-600 to-teal-800 text-white border-teal-700 shadow-md',
    neutral: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    undefined: 'hidden'
  }

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-4 md:p-4',
    lg: 'p-8'
  }

  const iconVariantClasses = {
    income: 'bg-success-50 text-success-700',
    expense: 'bg-danger-50 text-danger-700',
    available: 'bg-white/20 text-white',
    neutral: 'bg-slate-100 text-slate-500',
    undefined: 'hidden'
  }

  const resolvedIconClass = computed(() => props.iconClass ?? iconVariantClasses[props.variant])

  const percentageColor = computed(() => {
    if (props.percentage === undefined) return ''
    if (props.variant === 'expense') {
      return props.percentage > 0 ? 'text-red-600' : 'text-green-600'
    }
    return props.percentage >= 0 ? 'text-green-600' : 'text-red-600'
  })

  const titleColor = computed(() => {
    return props.variant === 'available' ? 'white' : 'muted'
  })

  const formattedValue = computed(() => {
    if (props.value === undefined || props.value === null) return ''
    if (typeof props.value === 'string') return props.value
    const code = (props.currencyCode ?? 'COP') as Currency
    if (props.currency) return formatCurrency(props.value, code, props.decimals)
    return formatNumber(props.value, code, props.decimals)
  })
</script>

<template>
  <div
    :class="[
      'flex h-full flex-col rounded-xl border [box-shadow:0_1px_4px_0_rgb(0_0_0/0.07)]',
      variantClasses[variant],
      sizeClasses[size],
      className
    ]"
  >
    <div class="flex flex-1 flex-col">
      <!-- Icon + Title -->
      <div class="mb-3 flex items-center gap-3 md:gap-2">
        <IconBadge v-if="icon" :icon="icon" :icon-class="resolvedIconClass" size="md" />
        <Heading level="h4" size="sm" weight="bold" :color="titleColor" uppercase tracking="wider">
          {{ title }}
        </Heading>
      </div>

      <!-- Value -->
      <Heading
        v-if="value !== undefined && value !== null"
        level="h3"
        size="2xl"
        weight="bold"
        :color="variant === 'available' ? 'white' : 'primary'"
        class="mb-2"
      >
        {{ formattedValue }}
      </Heading>
      <slot name="content" />

      <!-- Footer: subtitle / percentage — anchored to bottom -->
      <div class="mt-auto">
        <Text
          v-if="subtitle"
          size="xs"
          :color="variant === 'available' ? 'white' : 'muted'"
          class="opacity-80"
        >
          {{ subtitle }}
        </Text>

        <div v-if="percentage !== undefined" class="flex items-center gap-1">
          <Icon
            :name="percentage >= 0 ? 'trending_up' : 'trending_down'"
            size="sm"
            :class="percentageColor"
          />
          <Text size="xs" weight="medium" :class="percentageColor">
            {{ percentage >= 0 ? '+' : '' }}{{ percentage }}%
          </Text>
          <Text
            v-if="percentageText"
            size="xs"
            :color="variant === 'available' ? 'white' : 'muted'"
            class="opacity-80"
          >
            {{ percentageText }}
          </Text>
        </div>

        <!-- Spacer when neither subtitle nor percentage — keeps height consistent -->
        <div v-if="subtitle === undefined && percentage === undefined" class="h-4" />
      </div>
    </div>
  </div>
</template>
