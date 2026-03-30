<script setup lang="ts">
  import { Container } from '@/components/atoms'
  import { DashboardHeader, DashboardSidebar, ModalNotification } from '@/components/organisms'
  import { useModalStore } from '@/stores/modal.store'
  const modalStore = useModalStore()
</script>
<template>
  <div class="flex h-screen w-full overflow-hidden bg-neutral-100 dark:bg-slate-950">
    <ModalNotification
      :show="modalStore.state.show"
      :type="modalStore.state.type"
      :options="modalStore.state.options"
      @update:show="modalStore.state.show = $event"
    />
    <ToastContainer />

    <aside class="fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-200 dark:border-slate-800">
      <DashboardSidebar />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col pl-64">
      <!-- Header con ancho dinámico -->
      <header
        class="fixed right-0 top-0 z-20 h-16 w-[calc(100%-16rem)] border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80"
      >
        <DashboardHeader />
      </header>

      <main class="flex-1 overflow-y-auto pt-16">
        <!-- El Container ahora recibirá un ancho calculado correctamente -->
        <Container>
          <slot />
        </Container>
      </main>
    </div>
  </div>
</template>
