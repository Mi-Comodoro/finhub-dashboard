<!-- layouts/dashboard.vue -->
<script setup lang="ts">
  import { computed } from 'vue' // Asegúrate de importar computed

  import { DashboardHeader, DashboardSidebar, ModalNotification } from '@/components/organisms'
  import { useSidebar } from '@/composables/useSidebar'
  import { useModalStore } from '@/stores/modal.store'

  const modalStore = useModalStore()
  const sidebar = useSidebar()

  // Mantenemos el computed para que sea dinámico,
  // pero QUITAMOS el .value para que no deje de ser reactivo.
  const isOpen = computed({
    get: () => sidebar.isOpen.value,
    set: val => (sidebar.isOpen.value = val)
  })
</script>

<template>
  <div class="dashboard-layout">
    <div class="relative z-[50]">
      <ModalNotification
        :show="modalStore.state.show"
        :type="modalStore.state.type"
        :options="modalStore.state.options"
        @update:show="modalStore.state.show = $event"
      />

      <ClientOnly>
        <div class="pointer-events-none fixed inset-0 z-[100]">
          <ToastContainer />
          <!-- Ahora v-model sí podrá cambiar el valor de isOpen -->
          <Slideover v-model:open="isOpen">
            <div class="pointer-events-auto h-full w-64 bg-white dark:bg-slate-900">
              <DashboardSidebar class="!flex h-full w-full" @navigate="sidebar.close" />
            </div>
          </Slideover>
        </div>
      </ClientOnly>
    </div>

    <div class="dashboard-container">
      <!-- SIDEBAR DESKTOP: Aquí usamos isCollapsed directamente del composable -->
      <aside class="dashboard-sidebar" :class="sidebar.isCollapsed.value ? 'lg:w-20' : 'lg:w-64'">
        <DashboardSidebar :is-collapsed="sidebar.isCollapsed.value" />
      </aside>

      <main class="dashboard-main">
        <div class="dashboard-header-fixed">
          <div class="dashboard-header__wrapper">
            <DashboardHeader />
          </div>
        </div>

        <div class="dashboard-scroll-area">
          <div class="dashboard-view-wrapper">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .dashboard-layout {
    @apply fixed inset-0 flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950;
  }

  .dashboard-container {
    @apply flex h-full w-full overflow-hidden;
  }

  .dashboard-sidebar {
    @apply z-30 hidden h-full shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:flex;
  }

  .dashboard-main {
    @apply flex h-full min-w-0 flex-1 flex-col overflow-hidden;
  }

  .dashboard-header-fixed {
    @apply w-full shrink-0 bg-transparent;
  }

  .dashboard-header__wrapper {
    @apply mx-auto w-full max-w-[1440px] px-6 py-2;
  }

  .dashboard-scroll-area {
    @apply flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950;
    overscroll-behavior: contain;
  }

  .dashboard-view-wrapper {
    @apply mx-auto w-full max-w-[1440px] px-6 pb-12 pt-6;
  }

  @screen lg {
    :deep(.dashboard-layout__header button[title='menu']),
    :deep(.dashboard-layout__header button[aria-label='menu']) {
      display: none !important;
    }
  }
</style>
