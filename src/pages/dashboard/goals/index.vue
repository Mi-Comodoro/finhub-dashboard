<script setup lang="ts">
  import { useAccountSavings } from '@/composables/useAccountSavings'
  import { useSavingGoals } from '@/composables/useSavingGoals'
  import { useAccountStore } from '@/stores/account.store'
  import { useAuthStore } from '@/stores/auth.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import { useModalStore } from '@/stores/modal.store'
  import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
  import { AlertBanner, Button, Text } from '~/components/atoms'
  import { AccountSavingForm, GoalsForm } from '~/components/business'
  import { ModalWizard } from '~/components/organisms'
  import { useToast } from '~/components/organisms/toast/useToast'
  import type { CompoundingFrequency } from '~/types/api'
  import DateUtils from '~/utils/date'

  const accountStore = useAccountStore()
  const goalsStore = useGoalsStore()
  const authStore = useAuthStore()
  const modalStore = useModalStore()
  const savingsAllocationsStore = useSavingAllocationsStore()
  const handleActions = () => {
    if (goalsStore.error?.status === 401) {
      authStore.clearAuth()
      return navigateTo('/', { replace: true })
    } else {
      modalStore.hideModal()
    }
  }
  const { sumAmountTarget, lastUpdate } = useSavingGoals()

  const { frequencyMap, getRateCategory } = useAccountSavings()
  const goals = computed(() => goalsStore.goals)

  definePageMeta({
    layout: 'dashboard',
    title: 'Metas',
    breadcrumb: 'Metas'
  })
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
    if (savingsAllocationsStore.savingAllocations.length < 1) {
      await savingsAllocationsStore.fetchSavingAllocations()
    }
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

  const onSavingAllocationSuccess = () => {
    show({
      title: 'Operacion Exitosa',
      description: 'Distribucion registrada con exito',
      type: 'success'
    })
    closeSavingDistributionForm()
  }
  const onError = () => {
    if (goalsStore.error) {
      modalStore.showModal('error', {
        title: goalsStore.error.title,
        message: goalsStore.error.message,
        actionLabel: 'Aceptar',
        onAction: handleActions
      })
    }
    closeSavingDistributionForm()
  }

  const onSavingAllocationError = () => {
    if (savingsAllocationsStore.error) {
      modalStore.showModal('error', {
        title: savingsAllocationsStore.error.title,
        message: savingsAllocationsStore.error.message,
        actionLabel: 'Aceptar',
        onAction: handleActions
      })
    }
  }
  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.defaultCurrency)

  const reasonTextMap: Record<string, string> = {
    emergency: 'text-red-600',
    elderly: 'text-amber-600',
    home: 'text-orange-600',
    school: 'text-blue-600',
    flight: 'text-sky-600',
    medical_services: 'text-rose-600',
    payments: 'text-green-600',
    trending_up: 'text-emerald-600',
    directions_car: 'text-indigo-600',
    shopping_cart: 'text-purple-600'
  }

  // 2. Mapa para el color de fondo (Contenedor)
  const reasonBgMap: Record<string, string> = {
    emergency: 'bg-red-100',
    elderly: 'bg-amber-100',
    home: 'bg-orange-100',
    school: 'bg-blue-100',
    flight: 'bg-sky-100',
    medical_services: 'bg-rose-100',
    payments: 'bg-green-100',
    trending_up: 'bg-emerald-100',
    directions_car: 'bg-indigo-100',
    shopping_cart: 'bg-purple-100'
  }

  const getFrequencyClass = (frequency: CompoundingFrequency) => {
    const classes: Record<CompoundingFrequency, string> = {
      daily: ' !text-green-600', // Diario (Alta actividad)
      monthly: '!text-secondary-600', // Mensual (Estándar)
      annually: '!bg-ghost-100 !text-ghost-600' // Anual (Largo plazo)
    }
    return classes[frequency] || 'bg-gray-100 text-gray-600'
  }
  const getLevelRateClass = (level: string) => {
    if (level === 'Alta') return '!bg-green-200 !text-green-700'
    if (level === 'Media') return '!bg-secondary-700 !text-secondary-200'
    if (level === 'Baja') return '!bg-yellow-500 !text-neutral-900'
    if (level === 'Muy Baja') return '!bg-red-700 !text-red-200'

    return 'bg-gray-200 text-gray-500'
  }
  const isAccountExits = computed(() => accountStore.accounts.length >= 1)
  const isGoalsExists = computed(() => goals.value.length >= 1)
  const showBanner = computed(() => goals.value.length >= 2)

  const showSavingDistributionForm = ref(false)
  const createSavingDistributionForm = () => {
    showSavingDistributionForm.value = true
  }
  const closeSavingDistributionForm = () => {
    showSavingDistributionForm.value = false
  }
</script>

<template>
  <div class="space-y-4">
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
      <div>
        <Button size="sm" icon="segment" disabled variant="primary">Ver distribucion</Button>
      </div>
    </div>
    <div class="space-y-2 py-2">
      <AllocationSummary />

      <div v-if="showBanner" class="w-full">
        <Card class="flex w-full items-start gap-2">
          <IconBadge icon="celebration" variant="primary" size="md" />
          <div class="w-full leading-relaxed">
            <Heading level="h1" size="sm" weight="extrabold" class="!text-primary-800">
              ¡Felicidades!
            </Heading>
            <Text size="xs" color="muted" class="w-full">
              Haz haz creado tus primeras {{ goals.length }} metas por un total de:
              <strong class="text-primary-800">
                {{ formatCurrency(sumAmountTarget(goals.length), currency) }}
              </strong>
              puedes seguir, creando metas o pasar al siguiente paso.
            </Text>
          </div>
          <div class="flex w-full justify-end self-center">
            <Button
              size="sm"
              variant="primary"
              icon="segment"
              @click="createSavingDistributionForm"
            >
              Distribuir mi Ahorro
            </Button>
          </div>
        </Card>
      </div>
    </div>
    <div class="grid w-full grid-cols-2 items-start gap-4">
      <div class="grid h-96 min-h-fit grid-cols-2 gap-4">
        <GoalsForm
          v-if="accountStore.accounts.length > 1"
          @on-success="onSuccess"
          @on-error="onError"
        />
        <div class="rounded-md bg-white px-2 py-3">
          <div class="relative z-10 flex flex-col gap-2 p-2">
            <div class="flex items-center gap-2 py-2">
              <Icon name="lightbulb" size="base" class-name="text-yellow-500" />
              <Heading
                level="h1"
                size="sm"
                weight="extrabold"
                class="uppercase leading-tight text-primary-700"
              >
                Recomendaciones
              </Heading>
            </div>

            <AlertBanner
              title="Cuentas de Alta Rentabilidad > 10% EA"
              variant="warning"
              icon="info"
            >
              <Text size="xs" class="flex items-start gap-1 text-yellow-900">
                <strong>
                  Uso:
                  <span class="font-normal">
                    Fondo de emergencia, ahorro a la vista y metas a corto plazo.
                  </span>
                </strong>
              </Text>
            </AlertBanner>
          </div>
          <div
            v-if="isAccountExits"
            class="flex max-h-[335px] min-h-[335px] flex-col justify-between p-2"
          >
            <div class="flex max-h-80 flex-col space-y-2 overflow-y-auto rounded-md">
              <Card
                v-for="(account, index) in accountStore.accounts"
                :key="index"
                class-name="!p-2"
              >
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
            <div class="mt-2 flex flex-col space-y-2 rounded-md">
              <Button type="submit" variant="primary" @click="createAccountSavings">Agregar</Button>
            </div>
          </div>
          <div
            v-else
            class="flex max-h-[335px] min-h-[335px] flex-col items-center justify-center p-2"
            :class="[
              {
                'border border-dashed border-neutral-400 bg-neutral-100': !isAccountExits
              }
            ]"
          >
            <div class="flex flex-col items-center space-y-2">
              <IconBadge icon="account_balance" size="md" />
              <Heading
                level="h1"
                size="sm"
                weight="extrabold"
                color="primary"
                class="leading-tight"
              >
                No se han creado cuentas
              </Heading>

              <Text size="xs" color="muted" class="!text-center">
                A continuacion crea las cuentas que vas a asociar a tus metas de ahorro
              </Text>
              <Button type="submit" size="sm" variant="ghost" @click="createAccountSavings">
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </div>
      <!-- Empty State  -->
      <div
        v-if="!isGoalsExists"
        class="flex flex-col items-center justify-center space-y-2 rounded-md border border-dashed border-neutral-400 bg-neutral-100"
      >
        <div class="flex flex-col items-center space-y-2">
          <IconBadge icon="add_task" size="md" />
          <Heading level="h1" size="sm" weight="extrabold" color="primary" class="leading-tight">
            Aqui veras tus Metas
          </Heading>

          <Text size="xs" color="muted" class="!text-center">
            Aqui Empieza el camino a tu Futuro
          </Text>
        </div>
      </div>
      <div class="mb-8 grid w-full grid-cols-1 items-start gap-4">
        <div
          v-if="isGoalsExists"
          class="box-content grid w-full grid-cols-1 gap-4 xl:grid-cols-[auto_1fr]"
        >
          <Card class="relative h-40 w-[385px] space-y-4 overflow-hidden" class-name="!p-0">
            <div class="relative z-10 p-4">
              <div class="flex flex-col gap-2 space-y-2">
                <div class="flex items-center gap-1">
                  <IconBadge
                    size="md"
                    icon="savings"
                    class="w-fit"
                    icon-class="bg-transparent text-yellow-600 text-primary-500 dark:bg-yellow-900/30 dark:text-yellow-400"
                  />
                  <CardInfo
                    level="h3"
                    title-size="sm"
                    weight="extrabold"
                    title="TOTAL"
                    sub-title="Proyeccion de ahorros"
                    sub-title-size="xs"
                    sub-title-color="muted"
                  />
                </div>

                <Heading size="3xl" weight="bold" class="flex items-end">
                  {{ formatCurrency(sumAmountTarget(goals.length), currency) }}
                  <span class="mx-2 text-base text-neutral-600">{{ currency }}</span>
                </Heading>

                <Text size="sm" class="truncate" color="muted">{{ lastUpdate()! }}</Text>
              </div>
            </div>
            <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
              <span class="material-symbols-outlined rotate-12 !text-[150px] text-yellow-600">
                savings
              </span>
            </div>
          </Card>

          <Card
            v-for="(goal, index) in goals.slice(0, 6)"
            :key="index"
            class="relative flex h-40 w-[385px] flex-col space-y-2 overflow-hidden rounded-md"
          >
            <div class="relative z-10 flex h-full flex-col justify-between">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-2">
                  <Icon
                    :name="goal.reason"
                    size="2xl"
                    :class-name="`rounded-md p-2 ${reasonTextMap[goal.reason]} ${reasonBgMap[goal.reason]}`"
                  />
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
                <Text color="primary" size="xs" class="ml-auto self-start">
                  {{ goal.isActive ? 'Activo' : 'Pausado' }}
                </Text>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex min-w-0 items-center gap-2">
                    <Text size="sm" class="truncate">
                      Objetivo
                      <span class="text-slate-400">(0%)</span>
                    </Text>
                  </div>
                  <Text size="sm" weight="semibold" class="shrink-0">
                    {{ formatCurrency(goal.targetAmount, currency) }}
                    <span class="text-xs">{{ currency }}</span>
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
              <div class="flex w-full justify-between">
                <Text size="xs">
                  Fecha de Meta: {{ DateUtils.formatDate(goal.targetDate, 'numeric') }}
                </Text>
              </div>
            </div>

            <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
              <span
                class="material-symbols-outlined rotate-12 !text-[150px]"
                :class="reasonTextMap[goal.reason]"
              >
                {{ goal.reason }}
              </span>
            </div>
          </Card>
          <Card
            v-if="goals.length > 5"
            class="relative h-40 w-[385px] space-y-4 overflow-hidden !bg-primary-900"
            class-name="!p-0"
          >
            <div class="relative z-10 p-4">
              <div class="flex flex-col justify-between">
                <div class="flex items-center gap-1">
                  <Heading level="h3" title-size="sm" weight="extrabold" color="white">
                    ¡Wow!
                  </Heading>
                </div>
                <div class="flex w-full flex-col">
                  <Text size="sm" class="leading-relaxed" color="white">
                    ¡Increíble progreso! Estás visualizando tu futuro con más de 6 metas activas.
                  </Text>
                  <Button variant="ghost" size="sm" class="ml-auto">Ver mas</Button>
                </div>
              </div>
            </div>
            <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
              <span class="material-symbols-outlined -rotate-90 !text-[150px] text-white">
                celebration
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
    <ModalWizard v-model:show="showAccountSavingsForm">
      <AccountSavingForm @on-close="closeAccountSavings" />
    </ModalWizard>
    <ModalWizard v-model:show="showSavingDistributionForm">
      <SavingDistributionForm
        @on-success="onSavingAllocationSuccess"
        @on-error="onSavingAllocationError"
        @on-close="closeSavingDistributionForm"
      />
    </ModalWizard>
  </div>
</template>
