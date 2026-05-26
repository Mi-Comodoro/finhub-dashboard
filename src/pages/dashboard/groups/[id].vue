<script setup lang="ts">
  import TravelExpenseSection from '@/components/business/groups/travel-expense/TravelExpenseSection.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useAuthStore } from '@/stores/auth.store'
  import type { GroupRole, GroupType } from '@/types/groups.types'

  definePageMeta({
    layout: 'dashboard',
    title: 'Detalle de Grupo',
    breadcrumb: 'Detalle',
    parents: ['Grupos']
  })

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const { success: successToast, error: errorToast } = useFeedback()

  const { selectedGroup, isLoading, fetchGroup, addMember, removeMember, deleteGroup } =
    useGroupsApplication()

  const groupId = computed(() => route.params.id as string)
  const currentUserId = computed(() => authStore.user?.id ?? '')

  const isOwner = computed(() => selectedGroup.value?.ownerId === currentUserId.value)

  const currentMemberRole = computed<GroupRole | null>(() => {
    const member = selectedGroup.value?.members.find(m => m.userId === currentUserId.value)
    return member?.role ?? null
  })

  const canManageMembers = computed(
    () => currentMemberRole.value === 'OWNER' || currentMemberRole.value === 'EDITOR'
  )

  // Invite member state
  const showInviteModal = ref(false)
  const inviteUserId = ref('')
  const isInviting = ref(false)

  // Delete group state
  const showDeleteModal = ref(false)
  const isDeleting = ref(false)

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

  const roleColors: Record<GroupRole, string> = {
    OWNER: 'primary',
    EDITOR: 'secondary',
    VIEWER: 'neutral'
  }

  const roleLabels: Record<GroupRole, string> = {
    OWNER: 'Propietario',
    EDITOR: 'Editor',
    VIEWER: 'Visualizador'
  }

  const handleInvite = async () => {
    if (!inviteUserId.value.trim()) return
    isInviting.value = true
    try {
      const { success } = await addMember(groupId.value, { userId: inviteUserId.value.trim() })
      if (success) {
        successToast('Miembro invitado', 'El miembro fue agregado al grupo.')
        showInviteModal.value = false
        inviteUserId.value = ''
      } else {
        errorToast('Error', 'No se pudo agregar el miembro.')
      }
    } finally {
      isInviting.value = false
    }
  }

  const handleLeave = async () => {
    const { success } = await removeMember(groupId.value, currentUserId.value)
    if (success) {
      successToast('Saliste del grupo', 'Ya no eres miembro de este grupo.')
      router.push('/dashboard/groups')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    const { success } = await removeMember(groupId.value, userId)
    if (success) {
      successToast('Miembro eliminado', 'El miembro fue removido del grupo.')
    }
  }

  const handleCancelInvite = () => {
    showInviteModal.value = false
    inviteUserId.value = ''
  }

  const handleDeleteGroup = async () => {
    isDeleting.value = true
    try {
      const { success } = await deleteGroup(groupId.value)
      if (success) {
        successToast('Grupo eliminado', 'El grupo fue eliminado correctamente.')
        router.push('/dashboard/groups')
      }
    } finally {
      isDeleting.value = false
      showDeleteModal.value = false
    }
  }

  onMounted(async () => {
    await fetchGroup(groupId.value)
  })
</script>

<template>
  <div class="group-detail">
    <!-- Loading skeleton -->
    <div v-if="isLoading && !selectedGroup" class="group-detail__skeleton-block" />

    <!-- Content -->
    <template v-else-if="selectedGroup">
      <!-- Header -->
      <div class="group-detail__header">
        <div class="group-detail__header-info">
          <div class="group-detail__title-row">
            <Heading level="h1" size="2xl" weight="extrabold">{{ selectedGroup.name }}</Heading>
            <UBadge
              :label="typeLabels[selectedGroup.type]"
              :color="typeColors[selectedGroup.type]"
              variant="subtle"
              size="sm"
            />
          </div>
          <Text size="xs" color="muted">
            {{ selectedGroup.members?.length ?? 0 }} miembros ·
            {{ selectedGroup.maxMembers }} máximo
          </Text>
        </div>

        <div class="group-detail__header-actions">
          <Button
            v-if="canManageMembers"
            variant="primary"
            size="sm"
            icon="person_add"
            @click="showInviteModal = true"
          >
            Invitar miembro
          </Button>
          <Button v-if="!isOwner" variant="ghost" size="sm" icon="logout" @click="handleLeave">
            Salir del grupo
          </Button>
          <Button
            v-if="isOwner"
            variant="danger"
            size="sm"
            icon="delete"
            @click="showDeleteModal = true"
          >
            Eliminar grupo
          </Button>
        </div>
      </div>

      <!-- Members section -->
      <Card class="group-detail__members-card">
        <div class="group-detail__members-header">
          <Heading level="h3" size="lg" weight="semibold">Miembros</Heading>
        </div>

        <div v-if="selectedGroup.members?.length === 0" class="group-detail__members-empty">
          <Text size="sm" color="muted">No hay miembros en este grupo.</Text>
        </div>

        <ul v-else class="group-detail__members-list">
          <li
            v-for="member in selectedGroup.members"
            :key="member.userId"
            class="group-detail__member-row"
          >
            <div class="group-detail__member-info">
              <span class="material-symbols-outlined group-detail__member-icon">person</span>
              <div>
                <Text size="sm" weight="medium">
                  {{ member.name ?? member.email ?? member.userId }}
                </Text>
                <Text v-if="member.email" size="xs" color="muted">{{ member.email }}</Text>
              </div>
            </div>
            <div class="group-detail__member-actions">
              <UBadge
                :label="roleLabels[member.role]"
                :color="roleColors[member.role]"
                variant="subtle"
                size="xs"
              />
              <Button
                v-if="isOwner && member.userId !== currentUserId"
                variant="ghost"
                size="sm"
                icon="person_remove"
                :icon-only="true"
                @click="handleRemoveMember(member.userId)"
              />
            </div>
          </li>
        </ul>
      </Card>

      <!-- Travel expenses section -->
      <Card class="group-detail__expenses-card">
        <TravelExpenseSection
          :group-id="groupId"
          :members="selectedGroup.members ?? []"
          :can-manage="canManageMembers"
          :current-user-id="currentUserId"
        />
      </Card>
    </template>

    <!-- Invite member modal -->
    <ModalWizard :show="showInviteModal">
      <div class="group-detail__invite-modal">
        <CardInfo
          title="Invitar Miembro"
          sub-title="Ingresa el ID del usuario que deseas invitar."
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="person_add"
          icon-size="md"
          icon-variant="primary"
        />
        <Input
          v-model="inviteUserId"
          label="ID del usuario"
          placeholder="Ingresa el ID del usuario"
          :required="true"
        />
        <div class="group-detail__invite-actions">
          <Button type="button" variant="ghost" size="sm" @click="handleCancelInvite">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            :disabled="!inviteUserId.trim()"
            @click="handleInvite"
          >
            {{ isInviting ? 'Invitando...' : 'Invitar' }}
          </Button>
        </div>
      </div>
    </ModalWizard>

    <!-- Delete confirmation modal -->
    <ModalWizard :show="showDeleteModal">
      <div class="group-detail__delete-modal">
        <CardInfo
          title="Eliminar Grupo"
          sub-title="Esta acción no se puede deshacer."
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="delete"
          icon-size="md"
          icon-variant="primary"
        />
        <Text size="sm" color="muted">
          ¿Estás seguro de que quieres eliminar el grupo
          <strong>{{ selectedGroup?.name }}</strong>
          ? Todos los miembros perderán acceso.
        </Text>
        <div class="group-detail__delete-actions">
          <Button type="button" variant="ghost" size="sm" @click="showDeleteModal = false">
            Cancelar
          </Button>
          <Button type="button" variant="danger" size="sm" @click="handleDeleteGroup">
            {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
          </Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .group-detail {
    @apply space-y-4;
  }

  .group-detail__skeleton-block {
    @apply h-48 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .group-detail__header {
    @apply flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between;
  }

  .group-detail__header-info {
    @apply flex flex-col gap-1;
  }

  .group-detail__title-row {
    @apply flex flex-wrap items-center gap-3;
  }

  .group-detail__header-actions {
    @apply flex flex-wrap gap-2;
  }

  .group-detail__members-card {
    @apply !p-5;
  }

  .group-detail__members-header {
    @apply mb-4;
  }

  .group-detail__members-empty {
    @apply py-8 text-center;
  }

  .group-detail__members-list {
    @apply divide-y divide-neutral-100 dark:divide-neutral-700;
  }

  .group-detail__member-row {
    @apply flex items-center justify-between py-3;
  }

  .group-detail__member-info {
    @apply flex items-center gap-3;
  }

  .group-detail__member-icon {
    @apply text-2xl text-neutral-400;
  }

  .group-detail__member-actions {
    @apply flex items-center gap-2;
  }

  .group-detail__invite-modal {
    @apply flex flex-col gap-4;
  }

  .group-detail__invite-actions {
    @apply flex justify-end gap-2;
  }

  .group-detail__delete-modal {
    @apply flex flex-col gap-4;
  }

  .group-detail__delete-actions {
    @apply flex justify-end gap-2;
  }
</style>
