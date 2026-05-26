<script setup lang="ts">
  import GroupForm from '@/components/business/groups/forms/GroupForm.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { GroupType } from '@/types/groups.types'

  definePageMeta({
    layout: 'dashboard',
    title: 'Grupos',
    breadcrumb: 'Grupos'
  })

  const router = useRouter()
  const { success: successToast } = useFeedback()

  const { groups, isLoading, fetchGroups } = useGroupsApplication()

  const showCreateModal = ref(false)

  const typeLabels: Record<GroupType, string> = {
    SHARED: 'Compartido',
    FAMILIAR: 'Familiar',
    TRAVEL: 'Viaje'
  }

  const typeColors: Record<GroupType, string> = {
    SHARED: 'secondary',
    FAMILIAR: 'primary',
    TRAVEL: 'warning'
  }

  const handleCreated = () => {
    showCreateModal.value = false
    successToast('Grupo creado', 'El grupo fue creado exitosamente.')
  }

  const goToDetail = (id: string) => {
    router.push(`/dashboard/groups/${id}`)
  }

  onMounted(async () => {
    await fetchGroups()
  })
</script>

<template>
  <div class="groups-page">
    <!-- Header -->
    <div class="groups-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Grupos</Heading>
        <Text size="xs" color="muted">Administra tus grupos colaborativos de finanzas</Text>
      </div>
      <Button variant="primary" size="sm" icon="add" @click="showCreateModal = true">
        Crear Grupo
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="groups-page__skeleton-grid">
      <div v-for="n in 3" :key="n" class="groups-page__skeleton" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!isLoading && groups.length === 0" class="groups-page__empty">
      <span class="material-symbols-outlined groups-page__empty-icon">group</span>
      <Heading level="h3" size="lg" weight="semibold">Sin grupos</Heading>
      <Text size="sm" color="muted">Crea tu primer grupo para colaborar con otros.</Text>
    </div>

    <!-- Group cards grid -->
    <div v-else class="groups-page__grid">
      <button
        v-for="group in groups"
        :key="group.id"
        class="groups-page__card"
        type="button"
        @click="goToDetail(group.id)"
      >
        <div class="groups-page__card-header">
          <Heading level="h3" size="lg" weight="semibold" class="groups-page__card-name">
            {{ group.name }}
          </Heading>
          <UBadge
            :label="typeLabels[group.type]"
            :color="typeColors[group.type]"
            variant="subtle"
            size="sm"
          />
        </div>
        <div class="groups-page__card-footer">
          <span class="material-symbols-outlined groups-page__member-icon">group</span>
          <Text size="sm" color="muted">{{ group.members?.length ?? 0 }} miembros</Text>
        </div>
      </button>
    </div>

    <!-- Create modal -->
    <ModalWizard :show="showCreateModal">
      <GroupForm @on-success="handleCreated" @on-close="showCreateModal = false" />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .groups-page {
    @apply space-y-4 px-4 py-2;
  }

  .groups-page__header {
    @apply flex items-center justify-between;
  }

  .groups-page__skeleton-grid {
    @apply grid grid-cols-1 gap-4 md:grid-cols-3;
  }

  .groups-page__skeleton {
    @apply h-28 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .groups-page__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .groups-page__empty-icon {
    @apply text-5xl text-neutral-300;
  }

  .groups-page__grid {
    @apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3;
  }

  .groups-page__card {
    @apply rounded-xl border border-neutral-200 bg-white p-5 text-left transition-shadow hover:shadow-md;
    @apply dark:border-neutral-700 dark:bg-neutral-800 dark:hover:shadow-lg;
  }

  .groups-page__card-header {
    @apply flex items-start justify-between gap-2;
  }

  .groups-page__card-name {
    @apply truncate;
  }

  .groups-page__card-footer {
    @apply mt-4 flex items-center gap-1;
  }

  .groups-page__member-icon {
    @apply text-base text-neutral-400;
  }
</style>
