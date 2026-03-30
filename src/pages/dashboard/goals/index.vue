<script setup lang="ts">
  import { useAccountSavings } from '@/composables/useAccountSavings'
  import { useAccountStore } from '@/stores/account.store'
  import { useAuthStore } from '@/stores/auth.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import { useModalStore } from '@/stores/modal.store'
  import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
  import { Button, Text } from '~/components/atoms'
  import { AccountSavingForm, GoalsForm } from '~/components/business'
  import { CardInfo } from '~/components/molecules'
  import { ModalWizard } from '~/components/organisms'
  import { useToast } from '~/components/organisms/toast/useToast'
  import type { CompoundingFrequency } from '~/types/api'

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
  const closeAccountSavings = () => {
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

  const goalsSetupCompleted = computed(() => goals.value.length >= 4 && goals.value.length < 5)
  const savingsAllocationSetupComplete = computed(
    () =>
      savingsAllocationsStore.savingAllocations.reduce(
        (acc, sa) => acc + Number(sa.percentage),
        0
      ) === 100
  )
  const showSavingDistributionForm = ref(false)
  const createSavingDistributionForm = () => {
    showSavingDistributionForm.value = true
  }
  const closeSavingDistributionForm = () => {
    showSavingDistributionForm.value = false
  }

  const showGoalsForm = ref(false)
  const createGoalsForm = () => {
    showGoalsForm.value = true
  }
  const closeGoalsForm = () => {
    showGoalsForm.value = false
  }
  const goalCards = computed(() =>
    goals.value.slice(0, 6).map(goal => ({
      title: goal.name,
      subtitle: goal.accountName,
      iconName: goal.reason,
      iconTextClass: reasonTextMap[goal.reason],
      iconBgClass: reasonBgMap[goal.reason],
      amount: null,
      targetAmount: goal.targetAmount,
      targetDate: String(goal.targetDate),
      status: goal.isActive ? 'active' : 'paused',
      showProgressbar: true,
      progressPercentage: 0 // luego dinámico
    }))
  )
  const savingAllocationTotal = computed(() =>
    savingsAllocationsStore.savingAllocations.reduce((acc, sa) => acc + Number(sa.percentage), 0)
  )
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="md:pr-4 xl:pr-0">
        <Heading level="h1" size="2xl" weight="extrabold" class="mb-1">
          Define tus Propositos
        </Heading>
        <Text size="sm" color="muted">
          Organiza tu futuro financiero creando propósitos específicos.
        </Text>
      </div>
      <div>
        <Button
          size="sm"
          icon="add_task"
          variant="primary"
          :disabled="!isAccountExits"
          :onclick="createGoalsForm"
        >
          Nueva Meta
        </Button>
      </div>
    </div>
    <AllocationSummary />

    <div>
      <Card class="flex w-full items-start gap-2">
        <IconBadge icon="lightbulb_2" variant="primary" size="md" />
        <div class="w-full leading-relaxed">
          <Heading level="h1" size="sm" weight="extrabold" class="!text-primary-800">
            Divide y Venceras
          </Heading>
          <Text size="xs" color="muted" class="w-full">
            Si tienes metas a largo plazo, dividelas en objetivos, cada objetivo te acerca mas a la
            meta.
          </Text>
        </div>
      </Card>
    </div>
    <div class="grid w-full grid-cols-12 gap-4">
      <div v-if="isGoalsExists" class="col-span-8 flex flex-col gap-4">
        <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <FinancialProgressCard v-for="(card, index) in goalCards" :key="index" v-bind="card" />
        </div>
        <Card
          v-if="goals.length > 6"
          class="relative flex h-40 w-full flex-col space-y-2 overflow-hidden rounded-md !bg-primary-900"
          class-name="!p-0"
        >
          <div class="relative z-10 p-4">
            <div class="flex flex-col justify-between">
              <div class="flex items-center gap-1">
                <Heading level="h3" title-size="sm" weight="extrabold" color="white">¡Wow!</Heading>
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

      <div class="col-span-4 flex flex-col gap-4">
        <!--  -->
        <div class="w-full">
          <Heading level="h1" size="sm" weight="extrabold" class="p-1 !text-primary-800">
            Configuración Paso a Paso
          </Heading>
          <Card v-if="!isAccountExits" class="flex w-full items-start gap-2">
            <IconBadge icon="account_balance" variant="primary" size="md" />
            <div class="w-full leading-relaxed">
              <Heading level="h1" size="sm" weight="extrabold" class="!text-primary-800">
                Configuracion de Cuentas
              </Heading>
              <Text size="xs" color="muted" class="w-full">
                Configura tu primera cuenta, para desbloquear el siguiente paso. ¡No te preocupes no
                te pediremos datos de tu cuenta!
              </Text>
            </div>
          </Card>

          <Card v-if="isAccountExits && !goalsSetupCompleted" class="flex w-full items-start gap-2">
            <IconBadge icon="flag" variant="primary" size="md" />
            <div class="w-full leading-relaxed">
              <Heading level="h1" size="sm" weight="extrabold" class="!text-primary-800">
                Define para qué estás ahorrando
              </Heading>
              <Text size="xs" color="muted" class="w-full">
                Crea metas específicas para darle propósito a tu dinero. Entre más claras sean, más
                fácil será mantener el hábito.
                <strong class="text-primary-800">
                  ¡Configura al menos 4 para avanzar al siguiente paso!
                </strong>
              </Text>
            </div>
          </Card>

          <Card
            v-if="goalsSetupCompleted && !savingsAllocationSetupComplete"
            class="flex w-full items-start gap-2"
          >
            <IconBadge icon="celebration" variant="primary" size="md" />
            <div class="w-full leading-relaxed">
              <Heading level="h1" size="sm" weight="extrabold" class="!text-primary-800">
                Distribuye tu ahorro mensual
              </Heading>
              <Text size="xs" color="muted" class="w-full">
                ¡Decide cómo repartir tu ahorro entre tus metas. Este cálculo se basa en el 20% de
                tu ingreso estimado!
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

          <Card v-if="savingsAllocationSetupComplete" class="flex w-full items-start gap-2">
            <IconBadge icon="celebration" variant="primary" size="md" />
            <div class="w-full leading-relaxed">
              <Heading level="h1" size="sm" weight="extrabold" class="!text-primary-800">
                Tu estrategia de ahorro está definida
              </Heading>
              <Text size="xs" color="muted" class="w-full">
                Así se distribuirá tu ahorro cada mes según tu ingreso estimado. Podrás ajustarlo en
                cualquier momento.
              </Text>
            </div>
          </Card>
        </div>
        <!--  -->
        <div>
          <FinancialProgressCard
            :title="'Setup'"
            title-color="white"
            :subtitle="'Configura tu estrategia'"
            sub-title-color="white"
            icon-name="settings_slow_motion"
            icon-text-class="text-primary-600"
            currency-text-class="text-primary-600"
            show-alert
            class="!bg-primary-900"
          >
            <template #body>
              <SetupProgressCard
                :accounts-count="accountStore.accounts.length"
                :goals-count="goals.length"
                :distribution-percentage="savingAllocationTotal"
                @completed="() => console.log('Ir a presupuesto')"
              >
                <template #action>
                  <div class="flex flex-col justify-between">
                    <Text color="white" size="xs">
                      ¡Todo listo para comenzar! Ya definiste tu ahorro y organización inicial.
                      Ahora es momento de planificar tus gastos.
                      <span
                        class="mt-1 flex justify-center gap-2 rounded-md border border-neutral-300 bg-neutral-100 p-1 text-black"
                      >
                        <Icon name="rocket_launch" size="xs" />
                        <p>Activar Presupuesto</p>
                      </span>
                    </Text>
                  </div>
                </template>
              </SetupProgressCard>
            </template>
          </FinancialProgressCard>
        </div>
        <!--  -->
        <div class="rounded-md bg-white px-2 py-3">
          <div
            v-if="isAccountExits"
            class="flex max-h-[335px] min-h-[335px] flex-col space-y-4 p-2"
          >
            <div class="flex justify-between">
              <CardInfo
                title="Mis Cuentas"
                level="h2"
                weight="extrabold"
                sub-title="Gestiona tus cuentas"
                sub-title-size="sm"
                sub-title-color="muted"
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon="add"
                icon-only
                @click="createAccountSavings"
              />
            </div>
            <div class="flex max-h-80 flex-col space-y-2 overflow-y-auto rounded-md">
              <Card
                v-for="(account, index) in accountStore.accounts"
                :key="index"
                class-name="!p-2"
              >
                <div class="flex w-full flex-col">
                  <div class="flex flex-col items-start gap-2">
                    <div class="flex items-center gap-2">
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
                    </div>
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
    </div>
    <ModalWizard v-model:show="showGoalsForm">
      <div>
        <GoalsForm @on-success="onSuccess" @on-error="onError" @on-close="closeGoalsForm" />
      </div>
    </ModalWizard>
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
