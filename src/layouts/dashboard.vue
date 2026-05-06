<script setup lang="ts">
  import { Container } from '@/components/atoms'
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
    <ToastContainer />

    <!-- Mobile Sidebar -->
    <Slideover v-model:open="isOpen">
      <DashboardSidebar @navigate="close" />
    </Slideover>

    <!-- Desktop Sidebar -->
    <aside class="dashboard-layout__sidebar" :class="isCollapsed ? 'lg:w-20' : 'lg:w-64'">
      <DashboardSidebar :is-collapsed="isCollapsed" />
    </aside>

    <div class="dashboard-layout__right">
      <header class="dashboard-layout__header">
        <DashboardHeader />
      </header>
      <main class="dashboard-layout__main">
        <Container class="h-full w-full !max-w-full">
          <slot />
        </Container>
      </main>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .dashboard-layout {
    @apply flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-slate-950;
  }

  .dashboard-layout__sidebar {
    @apply hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:flex;
  }

  .dashboard-layout__right {
    @apply flex h-screen min-w-0 flex-1 flex-col overflow-hidden;
  }

  .dashboard-layout__header {
    @apply z-30 h-16 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80;
  }

  .dashboard-layout__main {
    @apply flex-1 overflow-y-auto p-4 md:p-6;
  }

  :deep(.container) {
    @apply !m-0 !p-0;
  }
</style>
