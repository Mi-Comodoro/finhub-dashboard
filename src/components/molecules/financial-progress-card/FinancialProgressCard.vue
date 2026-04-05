<script setup lang="ts">
  import { computed } from 'vue'

  import { Card, type HeadingColor, Icon, Text, type TextColor } from '@/components/atoms/'
  import { CardInfo } from '@/components/molecules'
  import { useFinancesStore } from '@/stores/finances.store'
  import { formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'
  // Propiedades
  const financeStore = useFinancesStore()
  const props = withDefaults(
    defineProps<{
      title?: string
      subtitle?: string
      amount?: number | null
      targetAmount?: number
      progressLabel?: string
      targetDate?: string
      status?: string
      iconName?: string
      iconMark?: string
      iconTextClass?: string
      iconBgClass?: string
      currencyTextClass?: string
      showProgressbar?: boolean
      showAlert?: boolean
      progressPercentage?: number
      pendingPercentage?: number
      textFooter?: string
      titleColor?: HeadingColor
      textColor?: HeadingColor
      subTitleColor?: TextColor
      variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'gold' | 'accent' | undefined
    }>(),
    {
      title: '',
      subtitle: '',
      iconName: '',
      iconMark: '',
      status: '',
      targetAmount: 0,
      progressLabel: '',
      targetDate: '',
      iconBgClass: '',
      iconTextClass: '',
      currencyTextClass: '',
      progressPercentage: 0,
      pendingPercentage: 0,
      showProgressbar: false,
      showAlert: false,
      textFooter: '',
      amount: null,
      titleColor: 'black',
      subTitleColor: 'muted',
      textColor: 'black',
      variant: undefined
    }
  )

  const progressWidth = computed(() => {
    return Math.min(props.progressPercentage, 100)
  })

  const statusText = computed(() =>
    props.status.trim().length ? (props.status === 'active' ? 'Activo' : 'Pausado') : ''
  )

  const currency = computed(() => financeStore.defaultCurrency)

  const amountRef = ref<HTMLElement | null>(null)
  const targetRef = ref<HTMLElement | null>(null)

  const isSmallAmount = ref(false)
  const isSmallTarget = ref(false)

  let amountObserver: ResizeObserver
  let targetObserver: ResizeObserver

  onMounted(async () => {
    await nextTick()

    if (amountRef.value) {
      amountObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          isSmallAmount.value = entry.contentRect.width < 300
        }
      })
      amountObserver.observe(amountRef.value)
    }

    if (targetRef.value) {
      targetObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          isSmallTarget.value = entry.contentRect.width < 250
        }
      })
      targetObserver.observe(targetRef.value)
    }
  })

  onUnmounted(() => {
    amountObserver?.disconnect()
    targetObserver?.disconnect()
  })

  const displayAmount = computed(() => {
    if (props.amount == null) return ''
    return isSmallAmount.value
      ? formatCompactCurrency(props.amount, currency.value)
      : formatCurrency(props.amount, currency.value)
  })

  const displayTargetAmount = computed(() => {
    if (!props.targetAmount) return ''
    return isSmallTarget.value
      ? formatCompactCurrency(props.targetAmount, currency.value)
      : formatCurrency(props.targetAmount, currency.value)
  })

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

  const styles = computed(() => {
    if (!props.variant) {
      return {
        icon: `${props.iconBgClass} ${props.iconTextClass}`,
        currency: props.currencyTextClass,
        alert: props.iconTextClass,
        bgAccent: props.iconTextClass,
        background: ''
      }
    }

    return variantStyles[props.variant]
  })
</script>
<template>
  <Card
    class="relative flex h-auto w-full flex-col space-y-2 overflow-hidden rounded-md"
    :class="styles.background"
  >
    <div ref="containerRef" class="relative z-10 flex h-full flex-col">
      <!-- Header Section -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <!-- Icon -->
          <Icon :name="iconName" size="2xl" :class-name="`rounded-md p-2 ${styles.icon}`" />
          <!-- Card Info -->
          <CardInfo
            level="h3"
            title-size="sm"
            weight="extrabold"
            :title="title.toUpperCase()"
            :color="titleColor"
            :sub-title="subtitle"
            sub-title-size="xs"
            :sub-title-color="subTitleColor"
          />
        </div>
        <!-- Status (Active or Paused) -->
        <Text color="primary" size="xs" class="ml-auto self-start">
          {{ statusText }}
        </Text>
      </div>

      <!-- Body Section -->
      <div
        v-if="amount != null && targetAmount === 0"
        ref="amountRef"
        class="flex min-h-10 flex-col items-start justify-center pt-6"
      >
        <Heading :color="textColor" size="3xl" weight="bold">
          {{ displayAmount }}
          <span class="text-xl uppercase" :class="styles.currency">
            {{ currency }}
          </span>
        </Heading>

        <!-- alert -->
        <Text v-if="amount !== 0 && showAlert" size="sm" :class="styles.alert">
          Distribuye el
          <strong>{{ pendingPercentage }}%</strong>
          restante.
        </Text>

        <!-- progress bar -->

        <div v-if="showProgressbar" class="flex w-full flex-col items-end gap-2">
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              class="h-full rounded-full bg-teal-500 transition-all duration-700"
              :style="{ width: `${progressWidth}%` }"
            />
          </div>
          <Text size="sm">
            {{ progressLabel }}
            <span class="text-right text-slate-400">{{ progressPercentage }}%</span>
          </Text>
        </div>
      </div>

      <div
        v-else-if="targetAmount && targetAmount > 0"
        ref="targetRef"
        class="mt-4 flex flex-col gap-2"
      >
        <!-- header progreso -->
        <div class="flex items-center justify-between gap-2">
          <Text size="sm">
            {{ progressLabel }}
            <span class="text-slate-400">({{ progressPercentage }}%)</span>
          </Text>

          <Text size="sm" weight="semibold">
            {{ displayTargetAmount }}
            <span class="text-xs">{{ currency }}</span>
          </Text>
        </div>

        <!-- progress bar -->
        <div
          v-if="showProgressbar"
          class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
        >
          <div
            class="h-full rounded-full bg-teal-500 transition-all duration-700"
            :style="{ width: `${progressWidth}%` }"
          />
        </div>

        <!-- fecha -->
        <Text v-if="targetDate" size="xs">
          Fecha: {{ DateUtils.formatDate(targetDate, 'numeric') }}
        </Text>
      </div>

      <!-- footer opcional -->
      <div class="mt-auto">
        <Text size="sm" color="muted" class="truncate">
          {{ textFooter }}
        </Text>
      </div>

      <slot name="body" />
    </div>

    <!-- Icon Background -->
    <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
      <span class="material-symbols-outlined !text-[150px]" :class="styles.bgAccent">
        {{ iconName || iconMark }}
      </span>
    </div>
  </Card>
</template>
