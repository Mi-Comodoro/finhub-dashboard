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

    <!-- Mobile: sidebar in USlideover overlay -->
    <USlideover v-model:open="isOpen" side="left" class="lg:hidden">
      <DashboardSidebar @navigate="close" />
    </USlideover>

    <!-- Desktop: sidebar as left flex column, hidden on mobile -->
    <aside
      class="dashboard-layout__sidebar"
      :class="isCollapsed ? 'lg:w-14' : 'lg:w-64'"
    >
      <DashboardSidebar />
    </aside>

    <!-- Right column: header stacked above main -->
    <div class="dashboard-layout__right">
      <header class="dashboard-layout__header">
        <DashboardHeader />
      </header>
      <main class="dashboard-layout__main">
        <Container>
          <slot />
        </Container>
      </main>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .dashboard-layout {
    @apply flex h-screen overflow-hidden bg-neutral-100 dark:bg-slate-950;
  }
  .dashboard-layout__sidebar {
    @apply hidden shrink-0 border-r border-slate-200 transition-all duration-200 lg:flex dark:border-slate-800;
  }
  .dashboard-layout__right {
    @apply flex flex-1 flex-col overflow-hidden;
  }
  .dashboard-layout__header {
    @apply z-30 h-16 shrink-0 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80;
  }
  .dashboard-layout__main {
    @apply flex-1 overflow-y-auto;
  }
</style>
