<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core'

  import GroupForm from '@/components/business/groups/forms/GroupForm.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useFriendshipsApplication } from '@/composables/application/useFriendshipsApplication'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useFriendshipsStore } from '@/stores/friendships.store'
  import type {
    FriendSearchResult,
    FriendshipRequest,
    FriendWithProfile
  } from '@/types/friendships.types'
  import type { GroupType } from '@/types/groups.types'

  definePageMeta({
    layout: 'dashboard',
    title: 'Grupos',
    breadcrumb: 'Grupos'
  })

  type MainTab = 'groups' | 'friends'
  type FriendTab = 'friends' | 'received' | 'sent'

  const router = useRouter()
  const { success: successToast, error: errorToast } = useFeedback()

  // --- Grupos ---
  const { groups, isLoading: isLoadingGroups, fetchGroups } = useGroupsApplication()
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

  // --- Amigos ---
  const friendshipsStore = useFriendshipsStore()
  const {
    loadAll,
    handleSendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelSent,
    handleRemoveFriend,
    handleSearchUsers
  } = useFriendshipsApplication()

  const friends = computed(() => friendshipsStore.friends)
  const receivedRequests = computed(() => friendshipsStore.receivedRequests)
  const sentRequests = computed(() => friendshipsStore.sentRequests)
  const isLoadingFriends = computed(() => friendshipsStore.isLoading)
  const pendingCount = computed(() => friendshipsStore.pendingCount)

  const activeTab = ref<MainTab>('groups')
  const activeFriendTab = ref<FriendTab>('friends')

  const showAddFriendModal = ref(false)
  const searchQuery = ref('')
  const searchResults = ref<FriendSearchResult[]>([])
  const isSearching = ref(false)
  const sendingHandle = ref<string | null>(null)
  const friendToRemove = ref<FriendWithProfile | null>(null)
  const showRemoveModal = ref(false)

  const handleSearch = useDebounceFn(async () => {
    if (searchQuery.value.length < 2) {
      searchResults.value = []
      return
    }
    isSearching.value = true
    const { results } = await handleSearchUsers(searchQuery.value)
    searchResults.value = results
    isSearching.value = false
  }, 400)

  const handleSend = async (result: FriendSearchResult) => {
    sendingHandle.value = result.handle
    const { success, error } = await handleSendRequest(result.handle)
    sendingHandle.value = null
    if (success) {
      successToast('Solicitud enviada', `Se envió solicitud a @${result.handle}`)
      searchQuery.value = ''
      searchResults.value = []
      showAddFriendModal.value = false
    } else {
      errorToast(error?.title ?? 'Error', error?.message ?? 'No se pudo enviar la solicitud')
    }
  }

  const handleAccept = async (request: FriendshipRequest) => {
    const { success, error } = await handleAcceptRequest(request.requester.id)
    if (success) {
      successToast('Solicitud aceptada', 'Ahora son amigos')
    } else {
      errorToast(error?.title ?? 'Error', error?.message ?? '')
    }
  }

  const handleReject = async (request: FriendshipRequest) => {
    const { success, error } = await handleRejectRequest(request.requester.id)
    if (success) {
      successToast('Solicitud rechazada', 'La solicitud fue rechazada')
    } else {
      errorToast(error?.title ?? 'Error', error?.message ?? '')
    }
  }

  const cancelSentHandle = ref<string | null>(null)

  const handleCancelRequest = async (addresseeId: string) => {
    cancelSentHandle.value = addresseeId
    const { success, error } = await handleCancelSent(addresseeId)
    cancelSentHandle.value = null
    if (success) {
      successToast('Solicitud cancelada', 'La solicitud fue cancelada')
    } else {
      errorToast(error?.title ?? 'Error', error?.message ?? '')
    }
  }

  const confirmRemove = (friend: FriendWithProfile) => {
    friendToRemove.value = friend
    showRemoveModal.value = true
  }

  const handleConfirmRemove = async () => {
    if (!friendToRemove.value) return
    const { success, error } = await handleRemoveFriend(friendToRemove.value.friendUserId)
    showRemoveModal.value = false
    friendToRemove.value = null
    if (success) {
      successToast('Amigo eliminado', 'La amistad fue eliminada')
    } else {
      errorToast(error?.title ?? 'Error', error?.message ?? '')
    }
  }

  watch(searchQuery, handleSearch)

  onMounted(async () => {
    await Promise.all([fetchGroups(), loadAll()])
  })
</script>

<template>
  <div class="groups-page">
    <!-- Main tabs -->
    <div class="groups-page__tabs">
      <button
        type="button"
        class="groups-page__tab"
        :class="{ 'groups-page__tab--active': activeTab === 'groups' }"
        @click="activeTab = 'groups'"
      >
        <span class="material-symbols-outlined groups-page__tab-icon">group</span>
        Grupos
      </button>
      <button
        type="button"
        class="groups-page__tab"
        :class="{ 'groups-page__tab--active': activeTab === 'friends' }"
        @click="activeTab = 'friends'"
      >
        <span class="material-symbols-outlined groups-page__tab-icon">people</span>
        Amigos
        <span v-if="pendingCount > 0" class="groups-page__tab-badge">{{ pendingCount }}</span>
      </button>
    </div>

    <!-- ===== TAB: GRUPOS ===== -->
    <template v-if="activeTab === 'groups'">
      <div class="groups-page__header">
        <div>
          <Heading level="h1" size="2xl" weight="extrabold">Grupos</Heading>
          <Text size="xs" color="muted">Administra tus grupos colaborativos de finanzas</Text>
        </div>
        <Button variant="primary" size="sm" icon="add" @click="showCreateModal = true">
          Crear Grupo
        </Button>
      </div>

      <div v-if="isLoadingGroups" class="groups-page__skeleton-grid">
        <div v-for="n in 3" :key="n" class="groups-page__skeleton" />
      </div>

      <div v-else-if="groups.length === 0" class="groups-page__empty">
        <span class="material-symbols-outlined groups-page__empty-icon">group</span>
        <Heading level="h3" size="lg" weight="semibold">Sin grupos</Heading>
        <Text size="sm" color="muted">Crea tu primer grupo para colaborar con otros.</Text>
      </div>

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
    </template>

    <!-- ===== TAB: AMIGOS ===== -->
    <template v-else>
      <div class="groups-page__header">
        <div>
          <Heading level="h1" size="2xl" weight="extrabold">Amigos</Heading>
          <Text size="xs" color="muted">Conecta con otras personas y comparte finanzas</Text>
        </div>
        <Button variant="primary" size="sm" icon="person_add" @click="showAddFriendModal = true">
          Agregar amigo
        </Button>
      </div>

      <!-- Friend sub-tabs -->
      <div class="groups-page__friend-tabs">
        <button
          type="button"
          class="groups-page__friend-tab"
          :class="{ 'groups-page__friend-tab--active': activeFriendTab === 'friends' }"
          @click="activeFriendTab = 'friends'"
        >
          Mis amigos
        </button>
        <button
          type="button"
          class="groups-page__friend-tab"
          :class="{ 'groups-page__friend-tab--active': activeFriendTab === 'received' }"
          @click="activeFriendTab = 'received'"
        >
          Solicitudes
          <span v-if="receivedRequests.length > 0" class="groups-page__tab-badge">
            {{ receivedRequests.length }}
          </span>
        </button>
        <button
          type="button"
          class="groups-page__friend-tab"
          :class="{ 'groups-page__friend-tab--active': activeFriendTab === 'sent' }"
          @click="activeFriendTab = 'sent'"
        >
          Enviadas
        </button>
      </div>

      <div v-if="isLoadingFriends" class="groups-page__skeleton-grid">
        <div v-for="n in 3" :key="n" class="groups-page__skeleton" />
      </div>

      <!-- Mis amigos -->
      <div v-else-if="activeFriendTab === 'friends'" class="groups-page__friend-list">
        <div v-if="friends.length === 0" class="groups-page__empty">
          <span class="material-symbols-outlined groups-page__empty-icon">group</span>
          <Heading level="h3" size="lg" weight="semibold">Sin amigos aún</Heading>
          <Text size="sm" color="muted">Agrega amigos usando su handle para empezar.</Text>
        </div>
        <div v-for="friend in friends" :key="friend.friendshipId" class="groups-page__friend-item">
          <div class="groups-page__friend-avatar">
            <span class="groups-page__friend-avatar-letter">
              {{ (friend.displayName ?? friend.handle ?? '?')[0].toUpperCase() }}
            </span>
          </div>
          <div class="groups-page__friend-info">
            <Text size="sm" weight="semibold">
              {{ friend.displayName ?? friend.handle ?? friend.friendUserId }}
            </Text>
            <Text v-if="friend.handle" size="xs" color="muted">@{{ friend.handle }}</Text>
          </div>
          <Button size="sm" variant="ghost" icon="person_remove" @click="confirmRemove(friend)">
            Eliminar
          </Button>
        </div>
      </div>

      <!-- Solicitudes recibidas -->
      <div v-else-if="activeFriendTab === 'received'" class="groups-page__friend-list">
        <div v-if="receivedRequests.length === 0" class="groups-page__empty">
          <span class="material-symbols-outlined groups-page__empty-icon">inbox</span>
          <Heading level="h3" size="lg" weight="semibold">Sin solicitudes</Heading>
          <Text size="sm" color="muted">No tienes solicitudes de amistad pendientes.</Text>
        </div>
        <div
          v-for="request in receivedRequests"
          :key="request.friendshipId"
          class="groups-page__friend-item"
        >
          <div class="groups-page__friend-avatar">
            <span class="groups-page__friend-avatar-letter">
              {{
                (request.requester.displayName ?? request.requester.handle ?? '?')[0].toUpperCase()
              }}
            </span>
          </div>
          <div class="groups-page__friend-info">
            <Text size="sm" weight="semibold">
              {{ request.requester.displayName ?? request.requester.handle ?? 'Usuario' }}
            </Text>
            <Text v-if="request.requester.handle" size="xs" color="muted">
              @{{ request.requester.handle }}
            </Text>
            <Text v-else size="xs" color="muted">Quiere ser tu amigo</Text>
          </div>
          <div class="groups-page__friend-actions">
            <Button size="sm" variant="primary" @click="handleAccept(request)">Aceptar</Button>
            <Button size="sm" variant="ghost" @click="handleReject(request)">Rechazar</Button>
          </div>
        </div>
      </div>

      <!-- Solicitudes enviadas -->
      <div v-else class="groups-page__friend-list">
        <div v-if="sentRequests.length === 0" class="groups-page__empty">
          <span class="material-symbols-outlined groups-page__empty-icon">send</span>
          <Heading level="h3" size="lg" weight="semibold">Sin solicitudes enviadas</Heading>
          <Text size="sm" color="muted">No has enviado solicitudes pendientes.</Text>
        </div>
        <div
          v-for="request in sentRequests"
          :key="request.friendshipId"
          class="groups-page__friend-item"
        >
          <div class="groups-page__friend-avatar">
            <span class="groups-page__friend-avatar-letter">
              {{
                (request.addressee.displayName ?? request.addressee.handle ?? '?')[0].toUpperCase()
              }}
            </span>
          </div>
          <div class="groups-page__friend-info">
            <Text size="sm" weight="semibold">
              {{ request.addressee.displayName ?? request.addressee.handle ?? 'Usuario' }}
            </Text>
            <Text v-if="request.addressee.handle" size="xs" color="muted">
              @{{ request.addressee.handle }}
            </Text>
          </div>
          <Button
            size="sm"
            variant="ghost"
            :disabled="cancelSentHandle === request.addressee.id"
            @click="handleCancelRequest(request.addressee.id)"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </template>

    <!-- Modal: Crear grupo -->
    <ModalWizard :show="showCreateModal">
      <GroupForm @on-success="handleCreated" @on-close="showCreateModal = false" />
    </ModalWizard>

    <!-- Modal: Agregar amigo -->
    <ModalWizard :show="showAddFriendModal">
      <div class="groups-page__add-modal">
        <div class="groups-page__modal-header">
          <Heading level="h2" size="xl" weight="extrabold">Agregar amigo</Heading>
          <button
            type="button"
            class="groups-page__modal-close"
            @click="showAddFriendModal = false"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <Text size="sm" color="muted">
          Busca un usuario por su handle para enviarle una solicitud.
        </Text>
        <div class="groups-page__search-wrapper">
          <span class="groups-page__search-at">@</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar handle..."
            class="groups-page__search-input"
          />
        </div>
        <div v-if="isSearching" class="groups-page__search-loading">
          <Text size="xs" color="muted">Buscando...</Text>
        </div>
        <div v-else-if="searchResults.length > 0" class="groups-page__search-results">
          <div v-for="result in searchResults" :key="result.id" class="groups-page__search-result">
            <div class="groups-page__result-info">
              <Text size="sm" weight="semibold">@{{ result.handle }}</Text>
              <Text size="xs" color="muted">{{ result.displayName }}</Text>
            </div>
            <Button
              size="sm"
              variant="primary"
              :disabled="sendingHandle === result.handle"
              @click="handleSend(result)"
            >
              {{ sendingHandle === result.handle ? 'Enviando...' : 'Solicitar' }}
            </Button>
          </div>
        </div>
        <div v-else-if="searchQuery.length >= 2" class="groups-page__search-empty">
          <Text size="sm" color="muted">No se encontraron usuarios con ese handle.</Text>
        </div>
      </div>
    </ModalWizard>

    <!-- Modal: Confirmar eliminar amigo -->
    <ModalWizard :show="showRemoveModal">
      <div class="groups-page__confirm-modal">
        <div class="groups-page__modal-header">
          <Heading level="h2" size="xl" weight="extrabold">Eliminar amigo</Heading>
          <button type="button" class="groups-page__modal-close" @click="showRemoveModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <Text size="sm">¿Estás seguro de que quieres eliminar a este amigo?</Text>
        <div class="groups-page__confirm-actions">
          <Button size="sm" variant="ghost" @click="showRemoveModal = false">Cancelar</Button>
          <Button size="sm" variant="danger" @click="handleConfirmRemove">Eliminar</Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .groups-page {
    @apply space-y-4 px-4 py-2;
  }

  .groups-page__tabs {
    @apply flex gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .groups-page__tab {
    @apply flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors;
    @apply hover:bg-white hover:text-neutral-900 hover:shadow-sm;
    @apply dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white;
  }

  .groups-page__tab--active {
    @apply bg-white font-semibold text-neutral-900 shadow-sm;
    @apply dark:bg-neutral-700 dark:text-white;
  }

  .groups-page__tab-icon {
    @apply text-base;
  }

  .groups-page__tab-badge {
    @apply flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-xs font-bold text-white;
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

  /* Friends sub-tabs */
  .groups-page__friend-tabs {
    @apply flex gap-1 rounded-lg border border-neutral-100 bg-neutral-50 p-1;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
    width: fit-content;
  }

  .groups-page__friend-tab {
    @apply flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors;
    @apply hover:bg-white hover:text-neutral-900;
    @apply dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white;
  }

  .groups-page__friend-tab--active {
    @apply bg-white font-semibold text-neutral-900 shadow-sm;
    @apply dark:bg-neutral-700 dark:text-white;
  }

  .groups-page__friend-list {
    @apply flex flex-col gap-2;
  }

  .groups-page__friend-item {
    @apply flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .groups-page__friend-avatar {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700;
    @apply dark:bg-primary-900/30 dark:text-primary-300;
  }

  .groups-page__friend-avatar-letter {
    @apply text-sm font-bold;
  }

  .groups-page__friend-info {
    @apply flex flex-1 flex-col;
  }

  .groups-page__friend-actions {
    @apply flex gap-2;
  }

  .groups-page__friend-status {
    @apply rounded-full bg-warning-100 px-3 py-1 text-xs font-medium text-warning-700;
    @apply dark:bg-warning-900/30 dark:text-warning-300;
  }

  /* Modals */
  .groups-page__add-modal,
  .groups-page__confirm-modal {
    @apply flex flex-col gap-4;
  }

  .groups-page__modal-header {
    @apply flex items-center justify-between;
  }

  .groups-page__modal-close {
    @apply flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors;
    @apply hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200;
  }

  .groups-page__search-wrapper {
    @apply flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2;
    @apply focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500;
    @apply dark:border-neutral-600 dark:bg-neutral-800;
  }

  .groups-page__search-at {
    @apply font-semibold text-primary-500;
  }

  .groups-page__search-input {
    @apply flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400;
    @apply dark:text-neutral-100;
  }

  .groups-page__search-loading {
    @apply flex justify-center py-4;
  }

  .groups-page__search-results {
    @apply flex flex-col gap-2;
  }

  .groups-page__search-result {
    @apply flex items-center justify-between rounded-lg border border-neutral-100 p-3;
    @apply dark:border-neutral-700;
  }

  .groups-page__result-info {
    @apply flex flex-col;
  }

  .groups-page__search-empty {
    @apply flex justify-center py-4;
  }

  .groups-page__confirm-actions {
    @apply flex justify-end gap-2;
  }
</style>
