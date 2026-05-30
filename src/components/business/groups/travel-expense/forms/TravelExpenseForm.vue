<script setup lang="ts">
  import CardRadio from '@/components/atoms/card-radio/CardRadio.vue'
  import DatePickerInput from '@/components/molecules/date-picker/DatePickerInput.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import MoneyInput from '@/components/molecules/input/MoneyInput.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { useTravelExpense } from '@/composables/application/useTravelExpense'
  import { useCurrency } from '@/composables/useCurrency'
  import type { GroupMember } from '@/types/groups.types'
  import type { SplitType } from '@/types/travel-expense.types'

  const props = defineProps<{
    groupId: string
    members: GroupMember[]
    currentUserId: string
  }>()

  const emit = defineEmits(['onSuccess', 'onClose'])

  const { format } = useCurrency()
  const { createExpense } = useTravelExpense()

  // Form state
  const description = ref('')
  const amount = ref(0)
  const expenseDate = ref<Date>(new Date())
  const splitType = ref<SplitType>('EQUAL')
  const paidBy = ref(props.currentUserId)
  const isSubmitting = ref(false)
  const validationError = ref('')

  interface MemberSplit {
    userId: string
    name: string
    amount: number
    percentage: number
  }

  const memberSplits = ref<MemberSplit[]>([])

  const paidByOptions = computed(() =>
    props.members.map(m => ({
      label: m.name ?? m.email ?? m.userId,
      value: m.userId
    }))
  )

  const splitOptions: { label: string; value: SplitType; icon: string }[] = [
    { label: 'Igual', value: 'EQUAL', icon: 'equal' },
    { label: 'Personalizado', value: 'CUSTOM', icon: 'tune' },
    { label: 'Porcentaje', value: 'PERCENTAGE', icon: 'percent' }
  ]

  const memberCount = computed(() => props.members.length)

  const equalSharePreview = computed(() => {
    if (memberCount.value === 0 || amount.value === 0) return ''
    const share = amount.value / memberCount.value
    return `Cada miembro paga ${format(share)}`
  })

  const customSum = computed(() => memberSplits.value.reduce((acc, m) => acc + (m.amount ?? 0), 0))

  const percentageSum = computed(() =>
    memberSplits.value.reduce((acc, m) => acc + (m.percentage ?? 0), 0)
  )

  const initSplits = () => {
    const n = memberCount.value
    if (n === 0) return
    const equalAmount = n > 0 ? Math.round((amount.value / n) * 100) / 100 : 0
    const equalPct = n > 0 ? Math.round((100 / n) * 100) / 100 : 0
    memberSplits.value = props.members.map(m => ({
      userId: m.userId,
      name: m.name ?? m.email ?? m.userId,
      amount: equalAmount,
      percentage: equalPct
    }))
  }

  watch(splitType, () => {
    initSplits()
    validationError.value = ''
  })

  onMounted(() => {
    initSplits()
    if (props.members.length > 0 && !props.members.find(m => m.userId === props.currentUserId)) {
      paidBy.value = props.members[0]?.userId ?? props.currentUserId
    }
  })

  const validate = (): boolean => {
    if (!description.value.trim()) {
      validationError.value = 'La descripción es requerida'
      return false
    }
    if (!amount.value || amount.value <= 0) {
      validationError.value = 'El monto debe ser mayor a cero'
      return false
    }
    if (splitType.value === 'CUSTOM') {
      const diff = Math.abs(customSum.value - amount.value)
      if (diff > 0.01) {
        validationError.value = `La suma de los montos (${format(customSum.value)}) debe ser igual al total (${format(amount.value)})`
        return false
      }
    }
    if (splitType.value === 'PERCENTAGE') {
      const diff = Math.abs(percentageSum.value - 100)
      if (diff > 0.01) {
        validationError.value = `La suma de los porcentajes (${percentageSum.value.toFixed(1)}%) debe ser 100%`
        return false
      }
    }
    validationError.value = ''
    return true
  }

  const handleSubmit = async () => {
    if (isSubmitting.value || !validate()) return
    isSubmitting.value = true
    try {
      const dateStr =
        expenseDate.value instanceof Date
          ? (expenseDate.value.toISOString().split('T')[0] ?? expenseDate.value.toISOString())
          : String(expenseDate.value)

      const assignments =
        splitType.value === 'CUSTOM'
          ? memberSplits.value.map(m => ({ userId: m.userId, amount: m.amount }))
          : splitType.value === 'PERCENTAGE'
            ? memberSplits.value.map(m => ({ userId: m.userId, percentage: m.percentage }))
            : props.members.map(m => ({ userId: m.userId }))

      const { success } = await createExpense({
        description: description.value.trim(),
        amount: amount.value,
        expenseDate: dateStr,
        splitType: splitType.value,
        groupId: props.groupId,
        assignments
      })

      if (success) emit('onSuccess')
    } catch (err) {
      console.error('[TravelExpenseForm] Error submitting:', err)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class="travel-expense-form">
    <CardInfo
      title="Agregar Gasto"
      sub-title="Registra un gasto del viaje y cómo dividirlo."
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title-size="xs"
      sub-title-color="muted"
      icon="receipt_long"
      icon-size="md"
      icon-variant="primary"
    />

    <div class="travel-expense-form__fields">
      <!-- Description -->
      <Input
        v-model="description"
        label="Descripción"
        placeholder="Ej. Cena en restaurante"
        :required="true"
      />

      <!-- Amount + PaidBy -->
      <div class="travel-expense-form__row">
        <MoneyInput v-model="amount" label="Monto total" prefix="COP" :required="true" />
        <Select
          v-model="paidBy"
          name="paidBy"
          label="¿Quién pagó?"
          :options="paidByOptions"
          :required="true"
        />
      </div>

      <!-- Date -->
      <DatePickerInput
        v-model="expenseDate"
        mode="single"
        label="Fecha del gasto"
        :required="true"
      />

      <!-- Split type -->
      <div class="travel-expense-form__split-label">
        <Text size="sm" weight="medium">División</Text>
      </div>
      <div class="travel-expense-form__split-options">
        <CardRadio
          v-for="opt in splitOptions"
          :key="opt.value"
          v-model="splitType"
          :value="opt.value"
          :label="opt.label"
          :icon="opt.icon"
          size="sm"
        />
      </div>

      <!-- EQUAL preview -->
      <div v-if="splitType === 'EQUAL' && equalSharePreview" class="travel-expense-form__preview">
        <span class="material-symbols-outlined travel-expense-form__preview-icon">info</span>
        <Text size="xs" color="muted">{{ equalSharePreview }}</Text>
      </div>

      <!-- CUSTOM: member amounts -->
      <div v-if="splitType === 'CUSTOM'" class="travel-expense-form__members">
        <div
          v-for="member in memberSplits"
          :key="member.userId"
          class="travel-expense-form__member-row"
        >
          <Text size="sm" class="travel-expense-form__member-name">{{ member.name }}</Text>
          <div class="travel-expense-form__member-input">
            <MoneyInput v-model="member.amount" label="" prefix="COP" />
          </div>
        </div>
        <div class="travel-expense-form__sum-row">
          <Text size="xs" color="muted">Suma:</Text>
          <Text
            size="xs"
            :class="
              Math.abs(customSum - amount) < 0.01
                ? 'travel-expense-form__sum--ok'
                : 'travel-expense-form__sum--error'
            "
          >
            {{ format(customSum) }} / {{ format(amount) }}
          </Text>
        </div>
      </div>

      <!-- PERCENTAGE: member percentages -->
      <div v-if="splitType === 'PERCENTAGE'" class="travel-expense-form__members">
        <div
          v-for="member in memberSplits"
          :key="member.userId"
          class="travel-expense-form__member-row"
        >
          <Text size="sm" class="travel-expense-form__member-name">{{ member.name }}</Text>
          <div class="travel-expense-form__member-input">
            <Input v-model="member.percentage" type="number" label="" placeholder="0" prefix="%" />
          </div>
        </div>
        <div class="travel-expense-form__sum-row">
          <Text size="xs" color="muted">Total %:</Text>
          <Text
            size="xs"
            :class="
              Math.abs(percentageSum - 100) < 0.01
                ? 'travel-expense-form__sum--ok'
                : 'travel-expense-form__sum--error'
            "
          >
            {{ percentageSum.toFixed(1) }}%
          </Text>
        </div>
      </div>

      <!-- Validation error -->
      <div v-if="validationError" class="travel-expense-form__error">
        <Text size="xs" color="error">{{ validationError }}</Text>
      </div>
    </div>

    <!-- Actions -->
    <div class="travel-expense-form__actions">
      <Button type="button" variant="ghost" size="sm" @click.stop="emit('onClose')">
        Cancelar
      </Button>
      <Button type="button" variant="primary" size="sm" @click="handleSubmit">
        {{ isSubmitting ? 'Guardando...' : 'Agregar Gasto' }}
      </Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .travel-expense-form {
    @apply flex h-full w-full flex-col gap-4;
  }

  .travel-expense-form__fields {
    @apply flex flex-col gap-4;
  }

  .travel-expense-form__row {
    @apply grid grid-cols-2 gap-4;
  }

  .travel-expense-form__split-label {
    @apply mt-1;
  }

  .travel-expense-form__split-options {
    @apply flex flex-row gap-2;
  }

  .travel-expense-form__preview {
    @apply flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-2;
    @apply dark:bg-primary-900;
  }

  .travel-expense-form__preview-icon {
    @apply text-base text-primary-600;
    @apply dark:text-primary-400;
  }

  .travel-expense-form__members {
    @apply flex flex-col gap-2 rounded-lg border border-neutral-200 p-3;
    @apply dark:border-neutral-600;
  }

  .travel-expense-form__member-row {
    @apply flex items-center justify-between gap-3;
  }

  .travel-expense-form__member-name {
    @apply min-w-0 flex-1 truncate;
  }

  .travel-expense-form__member-input {
    @apply w-32 shrink-0;
  }

  .travel-expense-form__sum-row {
    @apply mt-1 flex items-center justify-between border-t border-neutral-100 pt-2;
    @apply dark:border-neutral-700;
  }

  .travel-expense-form__sum--ok {
    @apply font-medium text-success-600;
  }

  .travel-expense-form__sum--error {
    @apply font-medium text-danger-600;
  }

  .travel-expense-form__error {
    @apply rounded-lg bg-danger-50 px-3 py-2;
    @apply dark:bg-danger-900;
  }

  .travel-expense-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
