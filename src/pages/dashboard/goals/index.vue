<script setup lang="ts">
  import { useAccountSavings } from '@/composables/useAccountSavings'
  import { useAccountStore } from '@/stores/account.store'
  import { useAuthStore } from '@/stores/auth.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import { useModalStore } from '@/stores/modal.store'
  import { Text } from '~/components/atoms'
  import { AccountSavingForm, GoalsForm } from '~/components/business'
  import { ModalWizard } from '~/components/organisms'
  import { useToast } from '~/components/organisms/toast/useToast'
  import type { CompoundingFrequency } from '~/types/api'
  import DateUtils from '~/utils/date'
  const modalStore = useModalStore()
  const accountStore = useAccountStore()
  const goalsStore = useGoalsStore()

  const authStore = useAuthStore()
  const { frequencyMap, getRateCategory } = useAccountSavings()
  const goals = computed(() => goalsStore.goals)

  const handleActions = () => {
    if (goalsStore.error?.status === 401) {
      authStore.clearAuth()
      return navigateTo('/', { replace: true })
    } else {
      modalStore.hideModal()
    }
  }
  onMounted(async () => {
    if (accountStore.accounts.length < 1) {
      await accountStore.fetchAccounts()
    }
    if (goalsStore.goals.length < 1) {
      await goalsStore.fetchGoals()
      if (goalsStore.error) {
        modalStore.showModal('error', {
          title: goalsStore.error.title,
          message: goalsStore.error.message,
          actionLabel: 'Aceptar',
          onAction: handleActions
        })
      }
    }
  })
  const getFrequencyClass = (frequency: CompoundingFrequency) => {
    const classes: Record<CompoundingFrequency, string> = {
      daily: '!bg-primary-900 !text-primary-200', // Diario (Alta actividad)
      monthly: '!bg-secondary-700 !text-secondary-100', // Mensual (Estándar)
      annually: '!bg-ghost-100 !text-ghost-600' // Anual (Largo plazo)
    }
    return classes[frequency] || 'bg-gray-100 text-gray-600'
  }
  const getLevelRateClass = (level: string) => {
    if (level === 'Alta') return '!bg-green-200 !text-green-700'
    if (level === 'Media') return '!bg-secondary-700 !text-secondary-200'
    if (level === 'Baja') return '!bg-yellow-700 !text-yellow-200'
    if (level === 'Muy Baja') return '!bg-red-700 !text-red-200'

    return 'bg-gray-200 text-gray-500'
  }

  definePageMeta({
    layout: 'dashboard',
    title: 'Metas',
    breadcrumb: 'Metas'
  })
  const showAccountSavingsForm = ref(false)
  const createAccountSavings = () => {
    showAccountSavingsForm.value = true
  }
  const { show } = useToast()
  const closeAccountSavings = (success: boolean | unknown) => {
    if (success) {
      show({
        title: 'Cuenta creada',
        description: 'Se registró correctamente',
        type: 'success'
      })
    } else {
      show({
        title: 'Error al guardar',
        description: 'Error al crear cuentas',
        type: 'error'
      })
    }
    showAccountSavingsForm.value = false
  }

  const onSuccess = () => {
    show({
      title: 'Meta Creada',
      description: 'Se registró correctamente',
      type: 'success'
    })
  }
  const onError = (errorMessage: string) => {
    show({
      title: 'Error al guardar',
      description: errorMessage,
      type: 'error'
    })
  }
  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.defaultCurrency)
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="flex items-center justify-between">
      <div class="md:pr-4 xl:pr-0">
        <Heading level="h1" size="2xl" weight="extrabold" class="mb-1">
          Define tus Propositos
        </Heading>
        <Text size="sm" color="muted">
          Organiza tu futuro financiero creando propósitos específicos. Elige un nombre, asocia una
          cuenta y define cuánto quieres alcanzar.
        </Text>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <GoalsForm
        v-if="accountStore.accounts.length > 1"
        @on-success="onSuccess"
        @on-error="onError"
      />
      <div class="space-y-2">
        <Card class="relative min-h-fit w-auto space-y-4 overflow-hidden" class-name="!p-0">
          <div class="relative z-10 flex flex-col gap-4 p-4">
            <div class="flex items-center gap-2">
              <Icon name="lightbulb" size="md" class-name="text-primary-900" />
              <Heading
                level="h1"
                size="sm"
                weight="extrabold"
                color="primary"
                class="leading-tight"
              >
                Recomendaciones
              </Heading>
            </div>

            <Card class="!bg-primary-900">
              <Label title-size="xs" weight="bold" color="white">
                Cuentas de Alta Rentabilidad
              </Label>
              <Text size="xs" color="warning" class="flex items-start gap-1">> 10% EA</Text>
              <Text size="xs" color="white" class="flex items-start gap-1">
                <strong>
                  Uso:
                  <span class="font-normal">
                    Fondo de emergencia, ahorro a la vista y metas a corto plazo.
                  </span>
                </strong>
              </Text>
            </Card>
          </div>
        </Card>
        <div v-if="accountStore.accounts.length > 1">
          <div class="flex max-h-56 flex-col space-y-2 overflow-y-auto rounded-md">
            <Card v-for="(account, index) in accountStore.accounts" :key="index" class-name="!p-2">
              <div class="flex w-full flex-col">
                <div class="flex items-start gap-2">
                  <Badge
                    :rounded="false"
                    class="!py-3"
                    :class-name="getLevelRateClass(getRateCategory(account.interestRate).level)"
                  >
                    {{ getInitials(account.name) }}
                  </Badge>
                  <CardInfo
                    level="h3"
                    title-size="sm"
                    weight="extrabold"
                    :title="account.name"
                    :sub-title="
                      account.description ||
                      getRateCategory(Number(account.interestRate)).description
                    "
                    sub-title-size="xs"
                    sub-title-color="muted"
                  />
                  <div class="ml-auto flex items-center gap-2">
                    <span
                      class="rounded-md px-2 py-0.5 text-xs font-semibold"
                      :class="getFrequencyClass(account.compoundingFrequency)"
                    >
                      {{ frequencyMap(account.compoundingFrequency) }}
                    </span>
                    <Text size="xs">{{ account.interestRate.toFixed(2) }}%EA</Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div class="mt-2 flex flex-col space-y-2 overflow-y-auto rounded-md">
            <Button type="submit" variant="primary" @click="createAccountSavings">Agregar</Button>
          </div>
        </div>
        <div
          v-else
          class="flex h-auto flex-col items-center space-y-2 overflow-y-auto rounded-md"
          :class="[
            {
              'border border-dashed border-neutral-400 bg-neutral-100':
                accountStore.accounts.length < 1
            }
          ]"
        >
          <Card class="flex flex-col items-center space-y-2">
            <IconBadge icon="account_balance" size="md" />
            <Heading level="h1" size="sm" weight="extrabold" color="primary" class="leading-tight">
              No se han creado cuentas
            </Heading>

            <Text size="xs" color="muted" class="!text-center">
              A continuacion crea las cuentas que vas a asociar a tus metas de ahorro
            </Text>
            <Button type="submit" variant="ghost" @click="createAccountSavings">Agregar</Button>
          </Card>
        </div>
      </div>

      <div
        v-if="goals.length < 1"
        class="rounded-md border border-dashed border-neutral-400 bg-neutral-100"
      ></div>
      <div class="mb-8 grid w-full grid-cols-1 items-start gap-4">
        <div class="grid w-fit grid-cols-1 gap-2 xl:grid-cols-[auto_1fr]">
          <Card
            v-for="(goal, index) in goals"
            :key="index"
            class="relative flex h-40 w-[350px] flex-col space-y-2 overflow-hidden rounded-md !border-l-8 !border-primary-700 p-4 shadow-md"
          >
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-2">
                <IconBadge :icon="goal.reason" variant="primary" />

                <CardInfo
                  level="h3"
                  title-size="sm"
                  weight="extrabold"
                  :title="goal.name.toUpperCase()"
                  :sub-title="goal.accountName"
                  sub-title-size="xs"
                  sub-title-color="muted"
                />
              </div>
              <Badge variant="primary" :rounded="false" class="ml-auto">{{ goal.isActive }}</Badge>
            </div>
            <div class="min-w-0 flex-1 space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex min-w-0 items-center gap-2">
                    <Text size="sm" class="truncate">
                      Objetivo
                      <span class="text-slate-400">(0%)</span>
                    </Text>
                  </div>
                  <Text size="sm" weight="semibold" class="shrink-0">
                    {{ formatCurrency(goal.targetAmount, currency) }} {{ currency }}
                  </Text>
                </div>
                <div
                  class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
                >
                  <!-- fills with cat.spent / cat.budgeted × 100 once transactions load -->
                  <div
                    :class="['h-full rounded-full bg-teal-500 transition-all duration-700']"
                    :style="{
                      width:
                        goal.targetAmount > 0
                          ? `${Math.min((0 / goal.targetAmount) * 100, 100)}%`
                          : '0%'
                    }"
                  />
                </div>
              </div>
            </div>
            <div class="flex w-full justify-between">
              <Text size="xs">
                Fecha de Meta: {{ DateUtils.formatDate(goal.targetDate, 'numeric') }}
              </Text>
            </div>
          </Card>
        </div>
      </div>
      <!-- <AccountSavings /> -->
    </div>
    <ModalWizard v-model:show="showAccountSavingsForm">
      <AccountSavingForm @on-close="closeAccountSavings" />
    </ModalWizard>
  </div>
</template>
