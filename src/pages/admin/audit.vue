<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'

  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { useAdminApplication } from '@/composables/application/useAdminApplication'
  import { useTimezone } from '@/composables/useTimezone'
  import type { AuditLogFilters } from '@/types/domain'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin', 'super-admin'],
    title: 'Auditoría',
    breadcrumb: 'Auditoría'
  })

  const { auditLogs, auditTotal, auditPage, isLoadingAudit, fetchAuditLogs } = useAdminApplication()
  const { formatDateTime } = useTimezone()

  const LIMIT = 20

  const actionOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'USER_ROLE_CHANGED', label: 'Rol cambiado' },
    { value: 'PLAN_CHANGED', label: 'Plan cambiado' },
    { value: 'TRIAL_EXTENDED', label: 'Trial extendido' },
    { value: 'USER_DELETED', label: 'Usuario eliminado' },
    { value: 'CONFIG_UPDATED', label: 'Config actualizada' },
    { value: 'ANNOUNCEMENT_SENT', label: 'Anuncio enviado' }
  ]

  const targetTypeOptions = [
    { value: '', label: 'Todos los objetivos' },
    { value: 'user', label: 'Usuario' },
    { value: 'config', label: 'Configuración' },
    { value: 'announcement', label: 'Anuncio' }
  ]

  const actionLabels: Record<string, string> = {
    USER_ROLE_CHANGED: 'Rol cambiado',
    PLAN_CHANGED: 'Plan cambiado',
    TRIAL_EXTENDED: 'Trial extendido',
    USER_DELETED: 'Usuario eliminado',
    CONFIG_UPDATED: 'Config actualizada',
    ANNOUNCEMENT_SENT: 'Anuncio enviado'
  }

  const filterAction = ref('')
  const filterTargetType = ref('')
  const filterFrom = ref('')
  const filterTo = ref('')
  const expandedId = ref<string | null>(null)

  const totalPages = computed(() => Math.ceil(auditTotal.value / LIMIT))

  const buildFilters = (page = 1): AuditLogFilters => ({
    action: filterAction.value || undefined,
    targetType: filterTargetType.value || undefined,
    from: filterFrom.value || undefined,
    to: filterTo.value || undefined,
    page
  })

  const applyFilters = () => fetchAuditLogs(buildFilters(1))
  const goToPage = (page: number) => fetchAuditLogs(buildFilters(page))

  const toggleExpand = (id: string) => {
    expandedId.value = expandedId.value === id ? null : id
  }

  const formatDate = (iso: string) => formatDateTime(iso)

  const getDetail = (item: (typeof auditLogs.value)[0]): string => {
    if (item.action === 'CONFIG_UPDATED') {
      return `${item.before?.value ?? '?'} → ${item.after?.value ?? '?'}`
    }
    if (item.action === 'USER_ROLE_CHANGED') {
      return `${item.before?.role ?? '?'} → ${item.after?.role ?? '?'}`
    }
    if (item.action === 'USER_DELETED') {
      return String(item.before?.email ?? item.targetId ?? '—')
    }
    if (item.action === 'ANNOUNCEMENT_SENT') {
      return `${item.after?.segment ?? '—'} · ${item.after?.recipientCount ?? 0} dest.`
    }
    return item.targetId ?? '—'
  }

  onMounted(() => fetchAuditLogs(buildFilters(1)))
</script>

<template>
  <div class="audit-page">
    <div class="audit-page__header">
      <Heading level="h1" size="2xl" weight="extrabold">Log de Auditoría</Heading>
      <Text size="xs" color="muted">
        Registro de todas las acciones privilegiadas realizadas por administradores
      </Text>
    </div>

    <!-- Filtros -->
    <div class="audit-page__filters">
      <select v-model="filterAction" class="audit-page__select">
        <option v-for="opt in actionOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <select v-model="filterTargetType" class="audit-page__select">
        <option v-for="opt in targetTypeOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <input v-model="filterFrom" class="audit-page__input" type="date" title="Desde" />
      <input v-model="filterTo" class="audit-page__input" type="date" title="Hasta" />

      <button class="audit-page__search-btn" @click="applyFilters">
        <span class="material-symbols-outlined">search</span>
        Buscar
      </button>
    </div>

    <!-- Tabla -->
    <div class="audit-page__card">
      <div v-if="isLoadingAudit" class="audit-page__skeleton-list">
        <div v-for="n in 8" :key="n" class="audit-page__skeleton-row" />
      </div>

      <div v-else-if="!auditLogs.length" class="audit-page__empty">
        <span class="material-symbols-outlined audit-page__empty-icon">manage_search</span>
        <Text size="sm" color="muted">No hay registros de auditoría con los filtros actuales</Text>
      </div>

      <table v-else class="audit-page__table">
        <thead>
          <tr>
            <th class="audit-page__th">Fecha</th>
            <th class="audit-page__th">Admin</th>
            <th class="audit-page__th">Acción</th>
            <th class="audit-page__th">Objetivo</th>
            <th class="audit-page__th">Detalle</th>
            <th class="audit-page__th audit-page__th--icon" />
          </tr>
        </thead>
        <tbody>
          <template v-for="item in auditLogs" :key="item.id">
            <tr
              class="audit-page__row"
              :class="{ 'audit-page__row--expanded': expandedId === item.id }"
              @click="toggleExpand(item.id)"
            >
              <td class="audit-page__td audit-page__td--date">{{ formatDate(item.createdAt) }}</td>
              <td class="audit-page__td audit-page__td--mono">{{ item.adminHandle }}</td>
              <td class="audit-page__td">
                <span
                  class="audit-page__action-badge"
                  :class="`audit-page__action-badge--${item.action.toLowerCase().replace(/_/g, '-')}`"
                >
                  {{ actionLabels[item.action] ?? item.action }}
                </span>
              </td>
              <td class="audit-page__td audit-page__td--mono">{{ item.targetId ?? '—' }}</td>
              <td class="audit-page__td audit-page__td--detail">{{ getDetail(item) }}</td>
              <td class="audit-page__td audit-page__td--icon">
                <span class="material-symbols-outlined audit-page__chevron">
                  {{ expandedId === item.id ? 'expand_less' : 'expand_more' }}
                </span>
              </td>
            </tr>
            <tr v-if="expandedId === item.id" class="audit-page__expanded-row">
              <td colspan="6" class="audit-page__expanded-cell">
                <div class="audit-page__json-grid">
                  <div>
                    <Text size="xs" color="muted">Antes</Text>
                    <pre class="audit-page__json">{{
                      JSON.stringify(item.before, null, 2) ?? 'null'
                    }}</pre>
                  </div>
                  <div>
                    <Text size="xs" color="muted">Después</Text>
                    <pre class="audit-page__json">{{
                      JSON.stringify(item.after, null, 2) ?? 'null'
                    }}</pre>
                  </div>
                </div>
                <div v-if="item.ip" class="audit-page__ip">
                  <Text size="xs" color="muted">IP: {{ item.ip }}</Text>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="audit-page__pagination">
      <button
        class="audit-page__page-btn"
        :disabled="auditPage <= 1"
        @click="goToPage(auditPage - 1)"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <Text size="sm">Página {{ auditPage }} de {{ totalPages }}</Text>
      <button
        class="audit-page__page-btn"
        :disabled="auditPage >= totalPages"
        @click="goToPage(auditPage + 1)"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .audit-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .audit-page__header {
    @apply flex flex-col gap-1;
  }

  .audit-page__filters {
    @apply flex flex-wrap items-center gap-2;
  }

  .audit-page__select,
  .audit-page__input {
    @apply rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white;
  }

  .audit-page__search-btn {
    @apply flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700;
  }

  .audit-page__search-btn .material-symbols-outlined {
    @apply text-base;
  }

  .audit-page__card {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .audit-page__skeleton-list {
    @apply flex flex-col gap-2 p-5;
  }

  .audit-page__skeleton-row {
    @apply h-10 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .audit-page__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .audit-page__empty-icon {
    @apply text-5xl text-neutral-300;
  }

  .audit-page__table {
    @apply w-full border-collapse;
  }

  .audit-page__th {
    @apply border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400;
  }

  .audit-page__th--icon {
    @apply w-8;
  }

  .audit-page__row {
    @apply cursor-pointer border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .audit-page__row--expanded {
    @apply bg-neutral-50 dark:bg-neutral-700;
  }

  .audit-page__td {
    @apply px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300;
  }

  .audit-page__td--date {
    @apply whitespace-nowrap text-xs text-neutral-500;
  }

  .audit-page__td--mono {
    @apply font-mono text-xs;
  }

  .audit-page__td--detail {
    @apply max-w-[200px] truncate text-xs text-neutral-600 dark:text-neutral-400;
  }

  .audit-page__td--icon {
    @apply text-center;
  }

  .audit-page__chevron {
    @apply text-base text-neutral-400;
  }

  .audit-page__action-badge {
    @apply rounded-full px-2 py-0.5 text-xs font-medium;
    @apply bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300;
  }

  .audit-page__action-badge--config-updated {
    @apply bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300;
  }

  .audit-page__action-badge--user-role-changed {
    @apply bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300;
  }

  .audit-page__action-badge--user-deleted {
    @apply bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300;
  }

  .audit-page__action-badge--announcement-sent {
    @apply bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300;
  }

  .audit-page__expanded-row {
    @apply bg-neutral-50 dark:bg-neutral-800;
  }

  .audit-page__expanded-cell {
    @apply px-4 pb-4 pt-2;
  }

  .audit-page__json-grid {
    @apply grid grid-cols-2 gap-4;
  }

  .audit-page__json {
    @apply mt-1 rounded-lg bg-neutral-100 p-3 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .audit-page__ip {
    @apply mt-2;
  }

  .audit-page__pagination {
    @apply flex items-center justify-center gap-4;
  }

  .audit-page__page-btn {
    @apply flex items-center justify-center rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-neutral-700;
  }

  .audit-page__page-btn .material-symbols-outlined {
    @apply text-xl;
  }
</style>
