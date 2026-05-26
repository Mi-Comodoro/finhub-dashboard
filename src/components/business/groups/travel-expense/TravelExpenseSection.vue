<script setup lang="ts">
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useTravelExpense } from '@/composables/application/useTravelExpense'
  import { useCurrency } from '@/composables/useCurrency'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { GroupMember } from '@/types/groups.types'

  import TravelExpenseForm from './forms/TravelExpenseForm.vue'

  const props = defineProps<{
    groupId: string
    members: GroupMember[]
    canManage: boolean
    currentUserId: string
  }>()

  const { format } = useCurrency()
  const { success: successToast, error: errorToast } = useFeedback()
  const { expenses, isLoading, fetchByGroup, settleAssignment, deleteExpense } = useTravelExpense()

  const showAddModal = ref(false)

  const handleExpenseCreated = () => {
    showAddModal.value = false
    successToast('Gasto agregado', 'El gasto fue registrado y distribuido entre los miembros.')
  }

  const handleSettle = async (expenseId: string, userId: string) => {
    const { success } = await settleAssignment(expenseId, userId, props.groupId)
    if (success) {
      successToast('Saldado', 'El pago fue marcado como saldado.')
    } else {
      errorToast('Error', 'No se pudo marcar como saldado.')
    }
  }

  const handleDelete = async (expenseId: string) => {
    const { success } = await deleteExpense(expenseId, props.groupId)
    if (success) {
      successToast('Gasto eliminado', 'El gasto fue eliminado correctamente.')
    }
  }

  const getMemberName = (userId: string): string => {
    const member = props.members.find(m => m.userId === userId)
    return member?.name ?? member?.email ?? userId
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

  // Debt summary
  const iOwe = computed(() => {
    return expenses.value.reduce((total, expense) => {
      if (expense.paidBy === props.currentUserId) return total
      const myAssignment = expense.assignments?.find(
        a => a.userId === props.currentUserId && !a.settled
      )
      return total + (myAssignment?.amount ?? 0)
    }, 0)
  })

  const theyOweMe = computed(() => {
    return expenses.value.reduce((total, expense) => {
      if (expense.paidBy !== props.currentUserId) return total
      const pending = expense.assignments?.filter(
        a => a.userId !== props.currentUserId && !a.settled
      )
      return total + (pending?.reduce((s, a) => s + a.amount, 0) ?? 0)
    }, 0)
  })

  onMounted(async () => {
    await fetchByGroup(props.groupId)
  })
</script>

<template>
  <div class="travel-section">
    <!-- Section header -->
    <div class="travel-section__header">
      <div>
        <Heading level="h3" size="lg" weight="semibold">Gastos del viaje</Heading>
        <Text size="xs" color="muted">
          {{ expenses.length }} gasto{{ expenses.length !== 1 ? 's' : '' }} registrado{{
            expenses.length !== 1 ? 's' : ''
          }}
        </Text>
      </div>
      <Button variant="primary" size="sm" icon="add" @click="showAddModal = true">
        Agregar gasto
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="travel-section__skeleton-list">
      <div v-for="n in 2" :key="n" class="travel-section__skeleton" />
    </div>

    <!-- Empty -->
    <div v-else-if="expenses.length === 0" class="travel-section__empty">
      <span class="material-symbols-outlined travel-section__empty-icon">receipt_long</span>
      <Text size="sm" color="muted">Sin gastos registrados. Agrega el primero.</Text>
    </div>

    <!-- Expense list -->
    <div v-else class="travel-section__list">
      <div v-for="expense in expenses" :key="expense.id" class="travel-section__expense-card">
        <!-- Expense header -->
        <div class="travel-section__expense-header">
          <div class="travel-section__expense-info">
            <Text size="sm" weight="semibold">{{ expense.description }}</Text>
            <Text size="xs" color="muted">
              {{ formatDate(expense.expenseDate) }} · Pagó {{ getMemberName(expense.paidBy) }}
            </Text>
          </div>
          <div class="travel-section__expense-meta">
            <Heading level="h4" size="base" weight="bold">{{ format(expense.amount) }}</Heading>
            <button
              v-if="canManage"
              type="button"
              class="travel-section__delete-btn"
              :title="'Eliminar gasto'"
              @click="handleDelete(expense.id)"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <!-- Assignments -->
        <ul class="travel-section__assignments">
          <li
            v-for="assignment in expense.assignments"
            :key="assignment.userId"
            class="travel-section__assignment-row"
          >
            <div class="travel-section__assignment-info">
              <span class="material-symbols-outlined travel-section__assignment-icon">person</span>
              <Text size="xs">{{ getMemberName(assignment.userId) }}</Text>
            </div>
            <div class="travel-section__assignment-right">
              <Text size="xs" weight="medium">{{ format(assignment.amount) }}</Text>
              <UBadge
                :label="assignment.settled ? 'Saldado' : 'Pendiente'"
                :color="assignment.settled ? 'success' : 'warning'"
                variant="subtle"
                size="xs"
              />
              <Button
                v-if="canManage && !assignment.settled"
                variant="ghost"
                size="sm"
                icon="check_circle"
                :icon-only="true"
                :title="'Marcar como saldado'"
                @click="handleSettle(expense.id, assignment.userId)"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Debt summary -->
    <div v-if="expenses.length > 0" class="travel-section__summary">
      <div class="travel-section__summary-row">
        <div class="travel-section__summary-item">
          <span class="material-symbols-outlined travel-section__summary-icon--danger">
            arrow_upward
          </span>
          <div>
            <Text size="xs" color="muted">Tú debes</Text>
            <Text size="sm" weight="semibold" class="travel-section__summary-danger">
              {{ format(iOwe) }}
            </Text>
          </div>
        </div>
        <div class="travel-section__summary-item">
          <span class="material-symbols-outlined travel-section__summary-icon--success">
            arrow_downward
          </span>
          <div>
            <Text size="xs" color="muted">Te deben</Text>
            <Text size="sm" weight="semibold" class="travel-section__summary-success">
              {{ format(theyOweMe) }}
            </Text>
          </div>
        </div>
      </div>
    </div>

    <!-- Add expense modal -->
    <ModalWizard :show="showAddModal">
      <TravelExpenseForm
        :group-id="groupId"
        :members="members"
        :current-user-id="currentUserId"
        @on-success="handleExpenseCreated"
        @on-close="showAddModal = false"
      />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .travel-section {
    @apply flex flex-col gap-4;
  }

  .travel-section__header {
    @apply flex items-center justify-between;
  }

  .travel-section__skeleton-list {
    @apply flex flex-col gap-3;
  }

  .travel-section__skeleton {
    @apply h-24 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .travel-section__empty {
    @apply flex flex-col items-center gap-2 py-8 text-center;
  }

  .travel-section__empty-icon {
    @apply text-4xl text-neutral-300;
  }

  .travel-section__list {
    @apply flex flex-col gap-3;
  }

  .travel-section__expense-card {
    @apply rounded-xl border border-neutral-200 bg-white p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .travel-section__expense-header {
    @apply flex items-start justify-between gap-3;
  }

  .travel-section__expense-info {
    @apply flex flex-col gap-0.5;
  }

  .travel-section__expense-meta {
    @apply flex shrink-0 items-center gap-2;
  }

  .travel-section__delete-btn {
    @apply text-neutral-400 transition-colors hover:text-danger-500;
  }

  .travel-section__delete-btn span {
    @apply text-lg;
  }

  .travel-section__assignments {
    @apply mt-3 divide-y divide-neutral-100 dark:divide-neutral-700;
  }

  .travel-section__assignment-row {
    @apply flex items-center justify-between py-2;
  }

  .travel-section__assignment-info {
    @apply flex items-center gap-2;
  }

  .travel-section__assignment-icon {
    @apply text-base text-neutral-400;
  }

  .travel-section__assignment-right {
    @apply flex items-center gap-2;
  }

  .travel-section__summary {
    @apply rounded-xl border border-neutral-200 bg-neutral-50 p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .travel-section__summary-row {
    @apply flex items-center gap-6;
  }

  .travel-section__summary-item {
    @apply flex items-center gap-2;
  }

  .travel-section__summary-icon--danger {
    @apply text-xl text-danger-500;
  }

  .travel-section__summary-icon--success {
    @apply text-xl text-success-600;
  }

  .travel-section__summary-danger {
    @apply text-danger-600;
  }

  .travel-section__summary-success {
    @apply text-success-600;
  }
</style>
