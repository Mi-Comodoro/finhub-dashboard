<script setup lang="ts">
  import Badge from '@/components/atoms/badge/Badge.vue'
  import type { BadgeVariant } from '@/components/atoms/badge/types/badge.types'
  import Button from '@/components/atoms/button/Button.vue'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import AccountSavingForm from '@/components/business/account/forms/AccountSavingForm.vue'
  import FinancialTipCarousel from '@/components/business/savings/FinancialTipCarousel.vue'
  import GoalsForm from '@/components/business/savings/forms/GoalsForm.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useToast } from '@/components/organisms/toast/useToast'
  import { useAccountSavingsApplication } from '@/composables/application/useAccountSavingsApplication'
  import { useActiveBudgetApplication } from '@/composables/application/useActiveBudgetApplication'
  import { useFinancesApplication } from '@/composables/application/useFinancesApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { useSetupApplication } from '@/composables/application/useSetupApplication'
  import { useCommon } from '@/composables/useCommon'
  import type { CompoundingFrequency, GoalsData, Transaction } from '@/types/api'
  import { formatCurrency } from '@/utils/currency'
  import { FINANCIAL_TIPS } from '@/utils/financial-tips'
  import { getProgressPercentage as getProgressPercentageUtil } from '@/utils/goal-formatters'
  import {
    getGoalTerm,
    getStatusVariant,
    GOAL_STATUS_LABELS,
    GOAL_TERM_LABELS,
    type GoalStatus
  } from '@/utils/goals.utils'

  const router = useRouter()
  const { showModal } = useModalStore()

  const {
    loadGoalsData,
    loadSavingAllocations,
    fetchGoalContributions,
    error: goalsError,
    goals,
    removeGoal
  } = useGoalsApplication()
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
  const { currency } = useFinancesApplication()

  const goalTransactionsMap = ref<Record<string, Transaction[]>>({})

  const getSavedAmountForGoal = (goalId: string): number => {
    const txns = goalTransactionsMap.value[goalId]
    const txTotal = txns ? txns.reduce((acc, t) => acc + (t.amount ?? 0), 0) : 0
    const goal = goals.value.find(g => g.id === goalId)
    const psTotal = goal?.totalSaved ?? 0
    return Math.max(txTotal, psTotal)
  }

  const getProgressPercentage = (goalId: string, targetAmount: number | null): number => {
    const saved = getSavedAmountForGoal(goalId)
    return getProgressPercentageUtil(saved, targetAmount)
  }

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

  const GOALS_TIPS = {
    compound: {
      id: 'g1',
      icon: 'trending_up',
      message: 'El interés compuesto es tu aliado',
      subMessage: 'Con una tasa activa tu ahorro crece solo. La clave es la constancia.'
    },
    onTrack: {
      id: 'g2',
      icon: 'check_circle',
      message: '¡Vas por buen camino!',
      subMessage: 'Cada aporte, por pequeño que sea, te acerca a tu meta.'
    }
  }

  const displayTips = computed(() => {
    const tips = [...FINANCIAL_TIPS.common, ...FINANCIAL_TIPS.savings]
    if (accounts.value.some(a => Number(a.interestRate) > 0)) {
      return [GOALS_TIPS.compound, ...tips]
    }
    if (goals.value.some(g => g.isActive)) {
      return [GOALS_TIPS.onTrack, ...tips]
    }
    return tips
  })

  definePageMeta({
    layout: 'dashboard',
    title: 'Metas',
    breadcrumb: 'Metas'
  })
  onMounted(async () => {
    if (goalsProgress.value < 1) {
      const { success } = await loadGoalsData()
      if (!success && goalsError.value) {
        showModal('error', {
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
    if (goals.value.length > 0) {
      const results = await Promise.all(goals.value.map(g => fetchGoalContributions(g.id)))
      goalTransactionsMap.value = Object.fromEntries(
        goals.value.map((g, i) => [g.id, results[i]?.result ?? []])
      )
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

  function frequencyVariant(frequency: CompoundingFrequency): BadgeVariant {
    const map: Record<CompoundingFrequency, BadgeVariant> = {
      daily: 'success',
      monthly: 'secondary',
      annually: 'default'
    }
    return map[frequency] ?? 'default'
  }

  function rateVariant(level: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      Alta: 'success',
      Media: 'secondary',
      Baja: 'warning',
      'Muy Baja': 'danger'
    }
    return map[level] ?? 'default'
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

  // Filters and view mode
  const activeFilter = ref<'all' | 'short' | 'medium' | 'long'>('all')
  const viewMode = ref<'card' | 'table'>('card')
  const goalToDelete = ref<string | null>(null)
  const showDeleteModal = ref(false)

  // Filtered goals
  const filteredGoals = computed(() => {
    const allGoals = goals.value
    if (activeFilter.value === 'all') return allGoals
    return allGoals.filter(g => getGoalTerm(g.targetDate) === activeFilter.value)
  })

  // Delete handlers
  const openDeleteModal = (id?: string) => {
    if (id) {
      goalToDelete.value = id
      showDeleteModal.value = true
    }
  }

  const handleDelete = async () => {
    if (!goalToDelete.value) return
    const { success } = await removeGoal(goalToDelete.value)
    showDeleteModal.value = false
    goalToDelete.value = null
    if (success) {
      show({
        title: 'Meta Eliminada',
        description: 'La meta se eliminó correctamente',
        type: 'success'
      })
    }
  }

  // Navigation to detail
  const goToDetail = (goalId: string) => {
    router.push(`/dashboard/goals/${goalId}`)
  }

  const goalCards = computed(() =>
    filteredGoals.value.slice(0, 6).map(goal => {
      const savedAmount = getSavedAmountForGoal(goal.id)
      const progressPercentage = getProgressPercentage(goal.id, goal.targetAmount ?? 0)

      return {
        goal,
        title: goal.name,
        subtitle: goal.accountName,
        iconName: goal.reason,
        iconTextClass: reasonTextMap[goal.reason],
        iconBgClass: reasonBgMap[goal.reason],
        variant: 'custom' as const,
        amount: savedAmount > 0 ? savedAmount : null,
        targetAmount: goal.targetAmount ?? undefined,
        targetDate: goal.targetDate ? String(goal.targetDate) : '',
        status: goal.isActive ? 'active' : 'paused',
        showProgressbar: true,
        progressPercentage
      }
    })
  )
</script>

<template>
  <div class="goals-page">
    <div class="goals-page__header">
      <div class="goals-page__header-text">
        <Heading level="h1" size="2xl" weight="extrabold" class="goals-page__title">
          Define tus Propositos
        </Heading>
        <Text size="xs" color="muted">
          Organiza tu futuro financiero creando propósitos específicos.
        </Text>
      </div>
      <div class="goals-page__header-actions">
        <!-- Filtros de plazo -->
        <div class="goals-page__filters">
          <button
            v-for="f in [
              { value: 'all', label: 'Todas' },
              { value: 'short', label: 'Corto plazo' },
              { value: 'medium', label: 'Mediano plazo' },
              { value: 'long', label: 'Largo plazo' }
            ]"
            :key="f.value"
            :class="[
              'goals-page__filter-chip',
              { 'goals-page__filter-chip--active': activeFilter === f.value }
            ]"
            @click="activeFilter = f.value as 'all' | 'short' | 'medium' | 'long'"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Toggle vista -->
        <div class="goals-page__view-toggle">
          <Button
            variant="ghost"
            icon-only
            size="sm"
            icon="grid_view"
            :class="{ 'goals-page__view-btn--active': viewMode === 'card' }"
            @click="viewMode = 'card'"
          />
          <Button
            variant="ghost"
            icon-only
            size="sm"
            icon="table_rows"
            :class="{ 'goals-page__view-btn--active': viewMode === 'table' }"
            @click="viewMode = 'table'"
          />
        </div>

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
    <FinancialTipCarousel :tips="displayTips" />
    <div class="goals-page__grid">
      <div v-if="isGoalsExists" class="goals-page__goals-section">
        <!-- Vista tarjetas -->
        <div v-if="viewMode === 'card'" class="goals-page__goals-cards">
          <div
            v-for="(card, index) in goalCards"
            :key="index"
            class="goals-page__goal-card-wrapper"
            @click="goToDetail(card.goal.id)"
          >
            <FinancialProgressCard v-bind="card" />
            <div class="goals-page__goal-actions">
              <Button
                icon="edit"
                variant="ghost"
                size="sm"
                icon-only
                @click.stop="editGoal(card.goal as ExistingGoal)"
              />
              <Button
                icon="delete"
                variant="ghost"
                size="sm"
                icon-only
                @click.stop="openDeleteModal(card.goal.id)"
              />
            </div>
          </div>
        </div>

        <!-- Vista tabla -->
        <div v-else class="goals-page__table-wrapper">
          <table class="goals-page__table">
            <thead>
              <tr>
                <th class="goals-page__table-col--name">Meta</th>
                <th class="goals-page__table-col--secondary">Cuenta</th>
                <th>Estado</th>
                <th class="goals-page__table-col--secondary">Plazo</th>
                <th>Progreso</th>
                <th>Objetivo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="goal in filteredGoals"
                :key="goal.id"
                class="goals-page__table-row"
                @click="goToDetail(goal.id)"
              >
                <td class="goals-page__table-col--name">{{ goal.name }}</td>
                <td class="goals-page__table-col--secondary">{{ goal.accountName }}</td>
                <td>
                  <Badge :variant="getStatusVariant(goal.status as GoalStatus)" size="xs">
                    {{ GOAL_STATUS_LABELS[(goal.status as GoalStatus) ?? 'SCHEDULED'] }}
                  </Badge>
                </td>
                <td class="goals-page__table-col--secondary">
                  {{ GOAL_TERM_LABELS[getGoalTerm(goal.targetDate)] }}
                </td>
                <td>
                  <div class="goals-page__progress-cell">
                    <div class="goals-page__progress-bar">
                      <div
                        class="goals-page__progress-fill"
                        :style="{
                          width: `${getProgressPercentage(goal.id, goal.targetAmount ?? 0)}%`
                        }"
                      ></div>
                    </div>
                    <span class="goals-page__progress-text">
                      {{ getProgressPercentage(goal.id, goal.targetAmount ?? 0) }}%
                    </span>
                  </div>
                </td>
                <td>{{ goal.targetAmount ? formatCurrency(goal.targetAmount, currency) : '—' }}</td>
                <td>
                  <div class="goals-page__table-actions">
                    <Button
                      variant="ghost"
                      icon="edit"
                      icon-only
                      size="sm"
                      @click.stop="editGoal(goal as ExistingGoal)"
                    />
                    <Button
                      variant="ghost"
                      icon="delete"
                      icon-only
                      size="sm"
                      @click.stop="openDeleteModal(goal.id)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="goals-page__empty-section">
        <div class="goals-page__empty-content">
          <EmptyStateIllustration type="no-goals" class="goals-page__empty-icon" />
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
                      <div class="goals-page__account-badge-wrapper">
                        <Badge
                          :rounded="false"
                          class="goals-page__account-badge"
                          :variant="rateVariant(getRateCategory(account.interestRate).level)"
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
                            getRateCategory(account.interestRate ?? 0).description
                          "
                          sub-title-size="xs"
                          sub-title-color="muted"
                        />
                      </div>
                      <div class="goals-page__account-edit">
                        <Button
                          icon="edit"
                          variant="ghost"
                          size="sm"
                          icon-only
                          @click="editAccount(account)"
                        />
                      </div>
                    </div>

                    <div class="goals-page__account-stats">
                      <Badge :variant="frequencyVariant(account.compoundingFrequency)" size="xs">
                        {{ frequencyMap(account.compoundingFrequency) }}
                      </Badge>
                      <Text size="xs">{{ account.interestRate.toFixed(2) }}%EA</Text>
                    </div>
                  </div>
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

    <!-- Modal de confirmación eliminar -->
    <ModalWizard v-model:show="showDeleteModal">
      <div class="goals-page__delete-modal">
        <Heading level="h3" size="lg">¿Eliminar esta meta?</Heading>
        <Text size="sm" color="muted">Esta acción no se puede deshacer.</Text>
        <div class="goals-page__delete-actions">
          <Button variant="danger" size="sm" @click="handleDelete">Eliminar</Button>
          <Button variant="ghost" size="sm" @click="showDeleteModal = false">Cancelar</Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .goals-page {
    @apply space-y-4 px-4 py-2;
  }

  .goals-page__header {
    @apply flex flex-col gap-4 md:flex-row md:items-center md:justify-between;
  }

  .goals-page__header-text {
    @apply md:pr-4 xl:pr-0;
  }

  .goals-page__header-actions {
    @apply flex flex-wrap items-center gap-2;
  }

  /* Filtros */
  .goals-page__filters {
    @apply flex gap-2;
  }

  .goals-page__filter-chip {
    @apply rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-primary-500 hover:bg-primary-50;
  }

  .goals-page__filter-chip--active {
    @apply border-primary-500 bg-primary-500 text-white hover:bg-primary-600;
  }

  /* Toggle vista */
  .goals-page__view-toggle {
    @apply flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1;
  }

  .goals-page__view-btn--active {
    @apply !bg-primary-900 !text-white;
  }

  .goals-page__title {
    @apply mb-1;
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
    @apply relative cursor-pointer transition-transform hover:scale-[1.02];
  }

  .goals-page__goal-actions {
    @apply absolute right-2 top-2 z-20 flex gap-1;
  }

  /* Tabla */
  .goals-page__table-wrapper {
    @apply overflow-x-auto rounded-lg shadow-sm;
  }

  .goals-page__table {
    @apply w-full min-w-[570px] table-fixed border-collapse bg-white;
  }

  .goals-page__table thead {
    @apply bg-neutral-100;
  }

  .goals-page__table th {
    @apply px-4 py-3 text-left text-xs font-semibold text-neutral-700;
  }

  .goals-page__table td {
    @apply border-t border-neutral-200 px-4 py-3 text-sm text-neutral-800;
  }

  .goals-page__table tbody tr:hover {
    @apply bg-neutral-50;
  }

  .goals-page__table-row {
    @apply cursor-pointer transition-colors;
  }

  .goals-page__table-actions {
    @apply flex gap-1;
  }

  .goals-page__table-col--secondary {
    @apply hidden 2xl:table-cell;
  }

  .goals-page__table-col--name {
    @apply w-[160px] truncate;
  }

  .goals-page__progress-cell {
    @apply flex items-center gap-2;
  }

  .goals-page__progress-bar {
    @apply h-2 w-16 overflow-hidden rounded-full bg-neutral-200 xl:w-24;
  }

  .goals-page__progress-fill {
    @apply h-full bg-primary-500 transition-all duration-300;
  }

  .goals-page__progress-text {
    @apply text-xs font-medium text-neutral-600;
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
    @apply w-32;
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
    @apply flex w-full items-center gap-2;
  }

  .goals-page__account-badge {
    @apply !py-3;
  }

  .goals-page__account-stats {
    @apply ml-auto flex items-center gap-2;
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

  /* Modal eliminar */
  .goals-page__delete-modal {
    @apply flex flex-col gap-4 p-6;
  }

  .goals-page__delete-actions {
    @apply flex justify-end gap-2;
  }

  .goals-page__account-edit {
    @apply place-items-end;
  }
</style>
