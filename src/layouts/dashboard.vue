<script setup lang="ts">
  import { DashboardHeader, DashboardSidebar, ModalNotification } from '@/components/organisms'
  import { useSidebar } from '@/composables/useSidebar'
  import { useModalStore } from '@/stores/modal.store'

  const modalStore = useModalStore()
  const { isOpen, isCollapsed, close } = useSidebar()
</script>

<template>
  <div class="dashboard-layout">
    <ModalNotification
      :show="modalStore.state.show"
      :type="modalStore.state.type"
      :options="modalStore.state.options"
      @update:show="modalStore.state.show = $event"
    />
    <ClientOnly><ToastContainer /></ClientOnly>

    <!-- Sidebar Móvil -->
    <Slideover v-model:open="isOpen">
      <DashboardSidebar @navigate="close" />
    </Slideover>

    <!-- Sidebar Desktop -->
    <aside class="dashboard-layout__sidebar" :class="isCollapsed ? 'lg:w-20' : 'lg:w-64'">
      <DashboardSidebar :is-collapsed="isCollapsed" />
    </aside>

    <div class="dashboard-layout__right">
      <header class="dashboard-layout__header">
        <!-- El CSS de abajo se encargará de ocultar el botón de menú aquí -->
        <DashboardHeader />
      </header>

      <main class="dashboard-layout__main">
        <div class="dashboard-content">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .dashboard-layout {
    /* bg-slate-50 da el contraste necesario para que las tarjetas blancas resalten */
    @apply flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950;
  }

  .dashboard-layout__sidebar {
    @apply hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:flex;
  }

  .dashboard-layout__right {
    @apply flex h-screen min-w-0 flex-1 flex-col overflow-hidden;
  }

  .dashboard-layout__header {
    @apply z-30 h-16 shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900;
  }

  .dashboard-layout__main {
    /* Eliminamos Container y usamos un padding estándar de dashboard */
    @apply flex-1 overflow-y-auto p-6 lg:p-6;
  }

  .dashboard-content {
    /* Max-width para que en pantallas 2K el dashboard no se "desparrame" */
    @apply mx-auto w-full max-w-[1440px];
  }

  /* ============================================================
     SOLUCIÓN BOTÓN: Oculta el botón de menú sin tocar 'Button.vue'
     ============================================================ */
  @screen lg {
    :deep(.dashboard-layout__header button[title='menu']),
    :deep(.dashboard-layout__header button[aria-label='menu']) {
      display: none !important;
    }
  }
</style>
