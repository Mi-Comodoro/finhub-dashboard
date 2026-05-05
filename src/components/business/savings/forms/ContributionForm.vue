<script setup lang="ts">
  import { computed, ref } from 'vue'

  import { Button } from '@/components/atoms'
  import { AlertBanner } from '@/components/atoms/alert-banner'
  import { CardInfo } from '@/components/molecules'
  import { Form } from '@/components/organisms'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import type { AccountData } from '@/types/api'
  import { formatCurrency } from '@/utils/currency'

  import { contributionFieldsSchema } from './schema/contribution.fields.schema'

  interface ContributionFormProps {
    goalId?: string
    accounts?: AccountData[]
  }

  const props = withDefaults(defineProps<ContributionFormProps>(), {
    goalId: '',
    accounts: () => []
  })
  const emit = defineEmits(['onClose'])

  const { addContribution } = useGoalsApplication()

  // Account options for select
  const accountOptions = computed(() =>
    props.accounts
      .filter(acc => acc.isActive)
      .map(acc => ({
        label: acc.name,
        value: acc.id,
        disabled: false
      }))
  )

  const formSchema = computed(() => contributionFieldsSchema(accountOptions.value))

  // Track form values to show account balance warning
  const contributionType = ref<'internal' | 'external' | null>(null)
  const selectedAccountId = ref<string | null>(null)

  // Get selected account details
  const selectedAccount = computed(() => {
    if (!selectedAccountId.value) return null
    return props.accounts.find(acc => acc.id === selectedAccountId.value)
  })

  // Initial data with today's date
  const initialData = computed(() => ({
    contributionType: 'external',
    accountId: '',
    amount: '',
    date: new Date(),
    notes: ''
  }))

  // Handle form value changes to track selected account
  const handleFormChange = (formData: Record<string, unknown>) => {
    contributionType.value = formData.contributionType as 'internal' | 'external' | null
    selectedAccountId.value = formData.accountId as string | null
  }

  const close = () => {
    emit('onClose')
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!props.goalId) {
      console.warn('[ContributionForm] goalId is required')
      return
    }

    try {
      const buildData = {
        contributionType: data.contributionType as string,
        accountId: data.contributionType === 'internal' ? (data.accountId as string) : undefined,
        amount: Number(data.amount) || 0,
        date: data.date as Date,
        notes: (data.notes as string) || undefined
      }

      const { success } = await addContribution(props.goalId, buildData)
      if (success) {
        emit('onClose')
      }
    } catch (error) {
      console.error('Error creating contribution:', error)
    }
  }
</script>

<template>
  <div class="contribution-form">
    <CardInfo
      title="Registrar Aporte"
      sub-title="Agrega un aporte a tu meta de ahorro."
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title-size="xs"
      sub-title-color="muted"
      icon="savings"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="contribution-form__content">
      <!-- Warning message when internal transfer is selected -->
      <AlertBanner
        v-if="contributionType === 'internal' && selectedAccount"
        variant="warning"
        class="contribution-form__warning"
      >
        <template #message>
          <span class="contribution-form__warning-text">
            Saldo disponible:
            <strong>{{ formatCurrency(0, 'COP') }}</strong>
            — Esta validación es referencial.
          </span>
        </template>
      </AlertBanner>

      <Form
        :schema="formSchema"
        :initial-data="initialData"
        @submit="handleSubmit"
        @change="handleFormChange"
      >
        <template #actions>
          <div class="contribution-form__actions">
            <Button type="button" variant="ghost" size="sm" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary" size="sm">Guardar</Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .contribution-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .contribution-form__content {
    @apply flex flex-col gap-4;
  }

  .contribution-form__warning {
    @apply mb-2;
  }

  .contribution-form__warning-text {
    @apply text-sm;
  }

  .contribution-form__actions {
    @apply flex items-center justify-end gap-3 pt-4;
  }
</style>
