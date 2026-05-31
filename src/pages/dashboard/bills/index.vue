<script setup lang="ts">
  import Badge from '@/components/atoms/badge/Badge.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import EmptyState from '@/components/atoms/empty-state/EmptyState.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import BillForm from '@/components/business/bills/forms/BillForm.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useBillsApplication } from '@/composables/application/useBillsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import { formatCurrency } from '@/utils/currency'
  import type { Bill } from '~/types/bills.types'

  definePageMeta({
    layout: 'dashboard',
    title: 'Facturas Recurrentes',
    breadcrumb: 'Facturas'
  })

  type TabFilter = 'all' | 'active' | 'inactive'

  const { bills, isLoading, toggleBill, deleteBill } = useBillsApplication()
  const { success: successToast, error: errorToast } = useFeedback()

  const activeTab = ref<TabFilter>('all')
  const showForm = ref(false)
  const showDeleteModal = ref(false)
  const editingBill = ref<Bill | null>(null)
  const billToDelete = ref<Bill | null>(null)

  const filteredBills = computed(() => {
    const all = bills.value ?? []
    if (activeTab.value === 'active') return all.filter(b => b.isActive)
    if (activeTab.value === 'inactive') return all.filter(b => !b.isActive)
    return all
  })

  const openCreate = () => {
    editingBill.value = null
    showForm.value = true
  }

  const openEdit = (bill: Bill) => {
    editingBill.value = bill
    showForm.value = true
  }

  const closeForm = () => {
    showForm.value = false
    editingBill.value = null
  }

  const onFormSuccess = () => {
    closeForm()
    successToast(
      editingBill.value ? 'Factura actualizada' : 'Factura creada',
      editingBill.value
        ? 'Los datos de la factura fueron actualizados.'
        : 'La factura fue registrada exitosamente.'
    )
  }

  const onToggle = async (bill: Bill) => {
    const { success } = await toggleBill(bill.id)
    if (!success) errorToast('Error', 'No se pudo cambiar el estado de la factura.')
  }

  const confirmDelete = (bill: Bill) => {
    billToDelete.value = bill
    showDeleteModal.value = true
  }

  const onDeleteConfirm = async () => {
    if (!billToDelete.value) return
    const { success } = await deleteBill(billToDelete.value.id)
    showDeleteModal.value = false
    if (success) {
      successToast('Factura eliminada', 'La factura fue eliminada correctamente.')
    } else {
      errorToast('Error', 'No se pudo eliminar la factura.')
    }
    billToDelete.value = null
  }

  const FREQUENCY_LABELS: Record<string, string> = {
    monthly: 'Mensual',
    yearly: 'Anual'
  }
</script>

<template>
  <div class="bills-page">
    <!-- HEADER -->
    <div class="bills-page__header">
      <div class="bills-page__header-info">
        <Heading level="h1" size="2xl" weight="extrabold">Facturas Recurrentes</Heading>
        <Text size="xs" color="muted">Gestiona tus compromisos de pago fijos</Text>
      </div>
      <Button variant="primary" size="sm" icon="add" @click="openCreate">Nueva Factura</Button>
    </div>

    <!-- TABS -->
    <div class="bills-page__tabs">
      <button
        v-for="tab in [
          { key: 'all', label: 'Todas' },
          { key: 'active', label: 'Activas' },
          { key: 'inactive', label: 'Inactivas' }
        ]"
        :key="tab.key"
        :class="['bills-page__tab', { 'bills-page__tab--active': activeTab === tab.key }]"
        @click="activeTab = tab.key as TabFilter"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="isLoading" class="bills-page__loading">
      <div class="bills-page__skeleton" />
      <div class="bills-page__skeleton" />
      <div class="bills-page__skeleton" />
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="filteredBills.length === 0" class="bills-page__empty">
      <EmptyState
        title="Sin facturas"
        description="Agrega tus facturas recurrentes para mantener un control de tus compromisos fijos."
        illustration="no-transactions"
      />
    </div>

    <!-- BILL LIST -->
    <div v-else class="bills-page__list">
      <div v-for="bill in filteredBills" :key="bill.id" class="bill-card">
        <div class="bill-card__main">
          <div class="bill-card__icon">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
          <div class="bill-card__info">
            <span class="bill-card__name">{{ bill.name }}</span>
            <div class="bill-card__meta">
              <Badge variant="default" size="xs">{{ FREQUENCY_LABELS[bill.frequency] }}</Badge>
              <Text size="xs" color="muted">Día {{ bill.billingDay }}</Text>
            </div>
          </div>
        </div>

        <div class="bill-card__right">
          <span class="bill-card__amount">{{ formatCurrency(bill.expectedAmount, 'COP') }}</span>
          <div class="bill-card__actions">
            <Button
              :icon="bill.isActive ? 'toggle_on' : 'toggle_off'"
              :variant="bill.isActive ? 'ghost' : 'ghost'"
              icon-only
              size="sm"
              :title="bill.isActive ? 'Desactivar' : 'Activar'"
              @click="onToggle(bill)"
            />
            <Button
              icon="edit"
              variant="ghost"
              icon-only
              size="sm"
              title="Editar"
              @click="openEdit(bill)"
            />
            <Button
              icon="delete"
              variant="ghost"
              icon-only
              size="sm"
              title="Eliminar"
              @click="confirmDelete(bill)"
            />
          </div>
          <Badge :variant="bill.isActive ? 'success' : 'default'" size="xs">
            {{ bill.isActive ? 'Activa' : 'Inactiva' }}
          </Badge>
        </div>
      </div>
    </div>

    <!-- FORM MODAL -->
    <ModalWizard :show="showForm" @close="closeForm">
      <BillForm
        :bill="editingBill"
        :mode="editingBill ? 'edit' : 'create'"
        @success="onFormSuccess"
        @close="closeForm"
      />
    </ModalWizard>

    <!-- DELETE CONFIRM MODAL -->
    <ModalWizard :show="showDeleteModal" @close="showDeleteModal = false">
      <div class="delete-modal">
        <div class="delete-modal__icon">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <Heading level="h2" size="lg" weight="semibold">¿Eliminar factura?</Heading>
        <Text size="sm" color="muted">
          Se eliminará
          <strong>{{ billToDelete?.name }}</strong>
          . Esta acción no se puede deshacer.
        </Text>
        <div class="delete-modal__actions">
          <Button variant="ghost" size="sm" @click="showDeleteModal = false">Cancelar</Button>
          <Button variant="danger" size="sm" icon="delete" @click="onDeleteConfirm">
            Eliminar
          </Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .bills-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .bills-page__header {
    @apply flex items-center justify-between;
  }

  .bills-page__header-info {
    @apply flex flex-col gap-0.5;
  }

  .bills-page__tabs {
    @apply flex gap-1 border-b border-neutral-200 dark:border-neutral-700;
  }

  .bills-page__tab {
    @apply px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900;
    @apply dark:text-neutral-400 dark:hover:text-white;
  }

  .bills-page__tab--active {
    @apply border-b-2 border-primary-600 text-primary-600 dark:text-primary-400;
  }

  .bills-page__loading {
    @apply flex flex-col gap-3;
  }

  .bills-page__skeleton {
    @apply h-20 w-full animate-pulse rounded-xl bg-slate-100;
    @apply dark:bg-neutral-700;
  }

  .bills-page__empty {
    @apply py-12;
  }

  .bills-page__list {
    @apply flex flex-col gap-3;
  }

  .bill-card {
    @apply flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .bill-card__main {
    @apply flex items-center gap-3;
  }

  .bill-card__icon {
    @apply flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600;
    @apply dark:bg-primary-900/20 dark:text-primary-400;
  }

  .bill-card__info {
    @apply flex flex-col gap-1;
  }

  .bill-card__name {
    @apply text-sm font-semibold text-neutral-900 dark:text-white;
  }

  .bill-card__meta {
    @apply flex items-center gap-2;
  }

  .bill-card__right {
    @apply flex items-center gap-3;
  }

  .bill-card__amount {
    @apply text-sm font-bold text-neutral-900 dark:text-white;
  }

  .bill-card__actions {
    @apply flex items-center gap-1;
  }

  .delete-modal {
    @apply flex flex-col items-center gap-4 p-6 text-center;
  }

  .delete-modal__icon {
    @apply flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-3xl text-danger-600;
    @apply dark:bg-danger-900/20 dark:text-danger-400;
  }

  .delete-modal__actions {
    @apply flex gap-3 pt-2;
  }
</style>
