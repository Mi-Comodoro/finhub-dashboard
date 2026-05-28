<!-- layouts/dashboard.vue -->
<script setup lang="ts">
  import { computed } from 'vue' // Asegúrate de importar computed

  import DashboardHeader from '@/components/organisms/header/DashboardHeader.vue'
  import ModalNotification from '@/components/organisms/modal-notification/ModalNotification.vue'
  import DashboardSidebar from '@/components/organisms/sidebar/DashboardSidebar.vue'
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
    @apply fixed inset-0 flex h-screen w-screen overflow-hidden;
    background-color: var(--surface-base);
  }

  .dashboard-container {
    @apply flex h-full w-full;
    min-height: 0; /* Necesario para respetar el overflow del hijo */
  }

  .dashboard-sidebar {
    @apply hidden h-screen shrink-0 flex-col overflow-y-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:flex;
    /* Evita que el scroll del contenido se propague al sidebar o al body */
    overscroll-behavior: contain;
    /* Aseguramos altura completa sin depender de clases externas */
    height: 100vh;
  }

  .dashboard-main {
    @apply flex h-screen min-w-0 flex-1 flex-col;
    /* Clave para que .dashboard-scroll-area pueda hacer scroll */
  }

  .dashboard-header-fixed {
    @apply w-full shrink-0 bg-transparent;
    /* El header permanece fijo en su posición gracias a que no está dentro del área de scroll */
  }

  .dashboard-header__wrapper {
    @apply mx-auto w-full max-w-[1440px] py-2 lg:px-4 xl:px-2;
  }

  .dashboard-scroll-area {
    @apply h-screen flex-1 overflow-y-auto;
    background-color: var(--surface-base);
  }

  .dashboard-view-wrapper {
    @apply mx-auto w-full max-w-[1440px] pb-12 pt-6 lg:px-4 xl:px-2;
  }

  @screen lg {
    :deep(.dashboard-layout__header button[title='menu']),
    :deep(.dashboard-layout__header button[aria-label='menu']) {
      display: none !important;
    }
  }
</style>
