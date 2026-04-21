<script setup lang="ts">
  import { Button, Text } from '@/components/atoms'
  import { AccountSavingForm, GoalsForm } from '@/components/business'
  import AccountRateTimeline from '@/components/business/account/AccountRateTimeline.vue'
  import { CardInfo } from '@/components/molecules'
  import { ModalWizard } from '@/components/organisms'
  import { useToast } from '@/components/organisms/toast/useToast'
  import { useAccountSavingsApplication } from '@/composables/application/useAccountSavingsApplication'
  import { useActiveBudgetApplication } from '@/composables/application/useActiveBudgetApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { useSetupApplication } from '@/composables/application/useSetupApplication'
  import { useCommon } from '@/composables/useCommon'
  import type { CompoundingFrequency, GoalsData } from '@/types/api'

  const router = useRouter()

  const { loadGoalsData, loadSavingAllocations, error: goalsError, goals } = useGoalsApplication()
  const handleActions = () => {
    if (goalsError.value?.status === 401) {
      return navigateTo('/', { replace: true })
    }
  }

  const { frequencyMap, getRateCategory, accounts } = useAccountSavingsApplication()

  const editingAccount = ref<(typeof accounts.value)[number] | null>(null)

  const {
    canActive,
    isAccountCreated,
    isGoalsCompleted,
    isSavingsAllocationCompleted,
    allocationProgress,
    goalsProgress,
    enabled
  } = useActiveBudgetApplication()
  const { currentBudgetId } = useSetupApplication()
  const { budgetStatus } = useCommon()
  const activateBudget = async () => {
    await enabled()

    if (currentBudgetId.value) {
      await router.push(`/dashboard/budget/${currentBudgetId.value}`)
    }
  }
  const steps = computed(() => [
    {
      key: 'accounts',
      title: 'Configura tus cuentas',
      description: 'Crea tu primera cuenta para comenzar.',
      icon: 'account_balance',
      condition: !isAccountCreated.value,
      actionLabel: 'Agregar',
      event: createAccountSavings
    },
    {
      key: 'goals',
      title: 'Define tus metas de ahorro',
      description: 'Crea al menos 3 metas: emergencia, retiro y una adicional.',
      icon: 'add_task',
      condition: isAccountCreated.value && !isGoalsCompleted.value,
      actionLabel: 'Agregar',
      event: createGoalsForm
    },
    {
      key: 'distribution',
      title: 'Distribuye tu ahorro',
      description: 'Decide cómo repartir tu ahorro, debes repartir el 100%',
      icon: 'segment',
      condition: isGoalsCompleted.value && !isSavingsAllocationCompleted.value,
      actionLabel: 'Distribuir',
      event: createSavingDistributionForm
    },
    {
      key: 'done',
      title: 'Tu estrategia está lista',
      description: 'Tu ahorro ya está distribuido.',
      icon: 'celebration',
      condition: canActive.value, // 🔥 fallback
      variant: 'success'
    }
  ])

  definePageMeta({
    layout: 'dashboard',
    title: 'Metas',
    breadcrumb: 'Metas'
  })
  onMounted(async () => {
    if (goalsProgress.value < 1) {
      const { success } = await loadGoalsData()
      if (!success && goalsError.value) {
        useModalStore().showModal('error', {
          title: goalsError.value.title,
          message: goalsError.value.message,
          actionLabel: 'Aceptar',
          onAction: handleActions
        })
      }
    }
    if (currentBudgetId.value) {
      await loadSavingAllocations(currentBudgetId.value)
    }
  })

  const showAccountSavingsForm = ref(false)
  const createAccountSavings = () => {
    editingAccount.value = null
    showAccountSavingsForm.value = true
  }
  const editAccount = (account: (typeof accounts.value)[number]) => {
    editingAccount.value = account
    showAccountSavingsForm.value = true
  }
  const { show } = useToast()
  const closeAccountSavings = (success?: boolean) => {
    const wasEditing = editingAccount.value !== null
    showAccountSavingsForm.value = false
    editingAccount.value = null
    if (success) {
      show({
        title: wasEditing ? 'Cuenta Actualizada' : 'Cuenta Creada',
        description: 'Se registró correctamente',
        type: 'success'
      })
    }
  }

  const handleGoalFormClose = (success?: boolean) => {
    const wasEditing = editingGoal.value !== null
    showGoalsForm.value = false
    editingGoal.value = null

    if (success) {
      show({
        title: wasEditing ? 'Meta Actualizada' : 'Meta Creada',
        description: 'La meta se guardó correctamente',
        type: 'success'
      })
    }
  }

  const onSavingAllocationSuccess = () => {
    show({
      title: 'Operacion Exitosa',
      description: 'Distribucion registrada con exito',
      type: 'success'
    })
    closeSavingDistributionForm()
  }

  const onSavingAllocationError = () => {
    if (goalsError.value) {
      show({
        title: goalsError.value.title,
        description: goalsError.value.message,
        type: 'error'
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
  const isAccountExits = computed(() => accounts.value?.length >= 1)
  const isGoalsExists = computed(() => goalsProgress.value >= 1)

  const showSavingDistributionForm = ref(false)
  const createSavingDistributionForm = () => {
    showSavingDistributionForm.value = true
  }
  const closeSavingDistributionForm = () => {
    showSavingDistributionForm.value = false
  }
  type ExistingGoal = GoalsData & { id: string }
  const editingGoal = ref<ExistingGoal | null>(null)

  const showGoalsForm = ref(false)
  const createGoalsForm = () => {
    editingGoal.value = null
    showGoalsForm.value = true
  }
  const editGoal = (goal: ExistingGoal) => {
    editingGoal.value = goal
    showGoalsForm.value = true
  }
  const goalCards = computed(() =>
    goals.value.slice(0, 6).map(goal => ({
      goal,
      title: goal.name,
      subtitle: goal.accountName,
      iconName: goal.reason,
      iconTextClass: reasonTextMap[goal.reason],
      iconBgClass: reasonBgMap[goal.reason],
      amount: null,
      targetAmount: goal.targetAmount ?? undefined,
      targetDate: goal.targetDate ? String(goal.targetDate) : '',
      status: goal.isActive ? 'active' : 'paused',
      showProgressbar: true,
      progressPercentage:
        goal.targetAmount && goal.targetAmount > 0 ? Math.round((0 / goal.targetAmount) * 100) : 0
    }))
  )
</script>

<template>
  <div class="goals-page">
    <div class="goals-page__header">
      <div class="goals-page__header-text">
        <Heading level="h1" size="2xl" weight="extrabold" class="goals-page__title">
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
          :disabled="!isAccountCreated"
          :onclick="createGoalsForm"
        >
          Nueva Meta
        </Button>
      </div>
    </div>
    <AllocationSummary />
    <div>
      <Card class="goals-page__tip-card">
        <IconBadge icon="lightbulb_2" variant="primary" size="md" />
        <div class="goals-page__tip-content">
          <Heading level="h1" size="sm" weight="extrabold" class="goals-page__tip-title">
            Divide y Venceras
          </Heading>
          <Text size="xs" color="muted" class="goals-page__tip-text">
            Si tienes metas a largo plazo, dividelas en objetivos, cada objetivo te acerca mas a la
            meta.
          </Text>
        </div>
      </Card>
    </div>
    <div class="goals-page__grid">
      <div v-if="isGoalsExists" class="goals-page__goals-section">
        <div class="goals-page__goals-cards">
          <div
            v-for="(card, index) in goalCards"
            :key="index"
            class="goals-page__goal-card-wrapper"
          >
            <FinancialProgressCard v-bind="card" />
            <Button
              icon="edit"
              variant="ghost"
              size="sm"
              icon-only
              class="goals-page__goal-edit-button"
              @click="editGoal(card.goal as ExistingGoal)"
            />
          </div>
        </div>
        <Card v-if="goals.length > 6" class="goals-page__achievement-card" class-name="!p-0">
          <div class="goals-page__achievement-content">
            <div class="goals-page__achievement-header">
              <div class="goals-page__achievement-title-wrapper">
                <Heading level="h3" title-size="sm" weight="extrabold" color="white">¡Wow!</Heading>
              </div>
              <div class="goals-page__achievement-body">
                <Text size="sm" class="goals-page__achievement-text" color="white">
                  ¡Increíble progreso! Estás visualizando tu futuro con más de 6 metas activas.
                </Text>
                <Button variant="ghost" size="sm" class="goals-page__achievement-button">
                  Ver mas
                </Button>
              </div>
            </div>
          </div>
          <div class="goals-page__achievement-icon">
            <span class="material-symbols-outlined goals-page__achievement-icon-symbol">
              celebration
            </span>
          </div>
        </Card>
      </div>
      <div v-else class="goals-page__empty-section">
        <div class="goals-page__empty-content">
          <Icon name="add_task" class="goals-page__empty-icon" size="2xl" />
          <Heading level="h3" color="muted">Aún no tienes metas</Heading>
          <Text size="sm" color="muted" class="goals-page__empty-text">
            Primero crea tus cuentas para poder definir tus metas financieras y comenzar a organizar
            tus finanzas de manera efectiva.
          </Text>
        </div>
      </div>

      <div class="goals-page__sidebar">
        <!--  -->
        <div v-if="budgetStatus !== 'ACTIVE'">
          <div v-for="(step, index) in steps" :key="index" class="goals-page__tip-step">
            <Tips
              v-if="step.condition"
              :title="step.title"
              :icon="step.icon"
              :description="step.description"
              :action-label="step.actionLabel"
              :event="step.event"
            />
          </div>
        </div>
        <!--  -->
        <div v-if="budgetStatus !== 'ACTIVE'">
          <FinancialProgressCard
            :title="'Setup'"
            title-color="white"
            :subtitle="'Configura tu estrategia'"
            sub-title-color="white"
            icon-name="settings_slow_motion"
            icon-text-class="text-primary-600"
            currency-text-class="text-primary-600"
            show-alert
            class="goals-page__setup-card"
          >
            <template #body>
              <SetupProgressCard
                :accounts-count="accounts.length"
                :goals-count="goalsProgress"
                :distribution-percentage="allocationProgress"
                @completed="() => console.log('Ir a presupuesto')"
              >
                <template #action>
                  <div v-if="canActive" class="goals-page__setup-action">
                    <Text color="white" size="xs">
                      ¡Todo listo para comenzar! Ya definiste tu ahorro y organización inicial.
                      Ahora es momento de planificar tus gastos.
                    </Text>
                    <div class="goals-page__setup-button">
                      <Button
                        icon="rocket_launch"
                        size="sm"
                        variant="ghost"
                        @click="activateBudget"
                      >
                        Activar
                      </Button>
                    </div>
                  </div>
                </template>
              </SetupProgressCard>
            </template>
          </FinancialProgressCard>
        </div>
        <!--  -->
        <div class="goals-page__accounts-wrapper">
          <div v-if="isAccountExits" class="goals-page__accounts-section">
            <div class="goals-page__accounts-header">
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
            <div class="goals-page__accounts-list">
              <Card v-for="(account, index) in accounts" :key="index" class-name="!p-2">
                <div class="goals-page__account-card">
                  <div class="goals-page__account-info">
                    <div class="goals-page__account-badge-wrapper">
                      <Badge
                        :rounded="false"
                        class="goals-page__account-badge"
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
                    <div class="goals-page__account-stats">
                      <span
                        class="goals-page__account-frequency"
                        :class="getFrequencyClass(account.compoundingFrequency)"
                      >
                        {{ frequencyMap(account.compoundingFrequency) }}
                      </span>
                      <Text size="xs">{{ account.interestRate.toFixed(2) }}%EA</Text>
                      <Button
                        icon="edit"
                        variant="ghost"
                        size="sm"
                        icon-only
                        @click="editAccount(account)"
                      />
                    </div>
                  </div>
                  <AccountRateTimeline :account-id="account.id" />
                </div>
              </Card>
            </div>
          </div>

          <div
            v-else
            class="goals-page__accounts-empty"
            :class="[
              {
                'goals-page__accounts-empty--bordered': !isAccountExits
              }
            ]"
          >
            <div class="goals-page__accounts-empty-content">
              <IconBadge icon="account_balance" size="md" />
              <Heading
                level="h1"
                size="sm"
                weight="extrabold"
                color="primary"
                class="goals-page__accounts-empty-title"
              >
                No se han creado cuentas
              </Heading>

              <Text size="xs" color="muted" class="goals-page__accounts-empty-text">
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
        <GoalsForm
          :mode="editingGoal ? 'edit' : 'create'"
          :initial-data="editingGoal"
          @on-close="handleGoalFormClose"
        />
      </div>
    </ModalWizard>
    <ModalWizard v-model:show="showAccountSavingsForm">
      <AccountSavingForm
        :mode="editingAccount ? 'edit' : 'create'"
        :initial-data="editingAccount"
        @on-close="closeAccountSavings"
      />
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

<style scoped lang="postcss">
  .goals-page {
    @apply space-y-4;
  }

  .goals-page__header {
    @apply flex items-center justify-between;
  }

  .goals-page__header-text {
    @apply md:pr-4 xl:pr-0;
  }

  .goals-page__title {
    @apply mb-1;
  }

  .goals-page__tip-card {
    @apply flex w-full items-start gap-2;
  }

  .goals-page__tip-content {
    @apply w-full leading-relaxed;
  }

  .goals-page__tip-title {
    @apply !text-primary-800;
  }

  .goals-page__tip-text {
    @apply w-full;
  }

  .goals-page__grid {
    @apply grid w-full grid-cols-12 gap-4;
  }

  .goals-page__goals-section {
    @apply col-span-8 flex flex-col gap-4;
  }

  .goals-page__goals-cards {
    @apply grid w-full grid-cols-1 gap-4 md:grid-cols-2;
  }

  .goals-page__goal-card-wrapper {
    @apply relative;
  }

  .goals-page__goal-edit-button {
    @apply absolute right-2 top-2 z-20;
  }

  .goals-page__achievement-card {
    @apply relative flex h-40 w-full flex-col space-y-2 overflow-hidden rounded-md !bg-primary-900;
  }

  .goals-page__achievement-content {
    @apply relative z-10 p-4;
  }

  .goals-page__achievement-header {
    @apply flex flex-col justify-between;
  }

  .goals-page__achievement-title-wrapper {
    @apply flex items-center gap-1;
  }

  .goals-page__achievement-body {
    @apply flex w-full flex-col;
  }

  .goals-page__achievement-text {
    @apply leading-relaxed;
  }

  .goals-page__achievement-button {
    @apply ml-auto;
  }

  .goals-page__achievement-icon {
    @apply pointer-events-none absolute -bottom-8 -right-8 opacity-20;
  }

  .goals-page__achievement-icon-symbol {
    @apply -rotate-90 !text-[150px] text-white;
  }

  .goals-page__empty-section {
    @apply col-span-8 flex flex-col items-center gap-4 rounded-md bg-slate-200;
  }

  .goals-page__empty-content {
    @apply flex h-full flex-col items-center gap-4 py-52;
  }

  .goals-page__empty-icon {
    @apply text-slate-400 dark:text-slate-600;
  }

  .goals-page__empty-text {
    @apply w-96 text-center;
  }

  .goals-page__sidebar {
    @apply col-span-4 flex flex-col gap-4;
  }

  .goals-page__tip-step {
    @apply flex flex-col;
  }

  .goals-page__setup-card {
    @apply !bg-primary-900;
  }

  .goals-page__setup-action {
    @apply flex flex-col justify-between;
  }

  .goals-page__setup-button {
    @apply flex justify-end;
  }

  .goals-page__accounts-wrapper {
    @apply rounded-md bg-white px-2 py-3;
  }

  .goals-page__accounts-section {
    @apply flex max-h-[335px] min-h-[335px] flex-col space-y-4 p-2;
  }

  .goals-page__accounts-header {
    @apply flex justify-between;
  }

  .goals-page__accounts-list {
    @apply flex max-h-80 flex-col space-y-2 overflow-y-auto rounded-md;
  }

  .goals-page__account-card {
    @apply flex w-full flex-col;
  }

  .goals-page__account-info {
    @apply flex flex-col items-start gap-2;
  }

  .goals-page__account-badge-wrapper {
    @apply flex items-center gap-2;
  }

  .goals-page__account-badge {
    @apply !py-3;
  }

  .goals-page__account-stats {
    @apply ml-auto flex items-center gap-2;
  }

  .goals-page__account-frequency {
    @apply rounded-md px-2 py-0.5 text-xs font-semibold;
  }

  .goals-page__accounts-empty {
    @apply flex max-h-[335px] min-h-[335px] flex-col items-center justify-center p-2;
  }

  .goals-page__accounts-empty--bordered {
    @apply border border-dashed border-neutral-400 bg-neutral-100;
  }

  .goals-page__accounts-empty-content {
    @apply flex flex-col items-center space-y-2;
  }

  .goals-page__accounts-empty-title {
    @apply leading-tight;
  }

  .goals-page__accounts-empty-text {
    @apply !text-center;
  }
</style>
