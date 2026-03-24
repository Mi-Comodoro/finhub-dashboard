<script setup lang="ts">
  import { Container } from '@/components/atoms'
  import { DashboardHeader, DashboardSidebar, ModalNotification } from '@/components/organisms'
  import { useModalStore } from '@/stores/modal.store'
  const modalStore = useModalStore()
</script>
<template>
  <div
    class="flex h-screen w-full flex-col bg-slate-200/25 transition-colors duration-200 dark:bg-slate-950"
  >
    <ModalNotification
      :show="modalStore.state.show"
      :type="modalStore.state.type"
      :options="modalStore.state.options"
      @update:show="modalStore.state.show = $event"
    />
    <ToastContainer />

    <!-- Header (top, full width) -->

    <!-- Body: sidebar + main -->
    <div class="flex min-h-0 flex-1">
      <!-- Sidebar (left) -->
      <aside class="w-72 flex-shrink-0 overflow-y-auto">
        <DashboardSidebar />
      </aside>

      <!-- Main content (right) -->
      <main class="flex-1 overflow-y-auto bg-slate-100/25 dark:bg-slate-950">
        <DashboardHeader />
        <Container>
          <slot />
        </Container>
      </main>
    </div>
  </div>
</template>
