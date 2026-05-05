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
    <!-- Modal y Toast se mantienen igual -->
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

    <!-- Desktop Sidebar: Se añade overflow-hidden para una transición limpia -->
    <aside class="dashboard-layout__sidebar" :class="isCollapsed ? 'lg:w-14' : 'lg:w-64'">
      <DashboardSidebar :is-collapsed="isCollapsed" />
    </aside>

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
    @apply flex h-screen w-screen flex-row overflow-hidden bg-neutral-100 dark:bg-slate-950;
  }

  .dashboard-layout__sidebar {
    /* 
       Añadido: overflow-hidden para que el contenido no sobresalga durante la animación.
       Añadido: transition-[width] para que solo anime el ancho y sea más eficiente.
    */
    @apply hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:flex;
  }

  .dashboard-layout__right {
    @apply flex h-screen min-w-0 flex-1 flex-col overflow-hidden;
  }

  .dashboard-layout__header {
    /* 
       Añadido: border-slate-200/dark:border-slate-800 para que el borde sea visible.
    */
    @apply z-30 h-16 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80;
  }

  .dashboard-layout__main {
    @apply flex-1 overflow-y-auto p-4; /* Un poco de padding para que el contenido no pegue a los bordes */
  }
</style>
