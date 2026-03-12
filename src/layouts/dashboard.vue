<script setup lang="ts">
  import { DashboardHeader, DashboardSidebar } from '@/components/organisms'
  import { ModalNotification } from '@/components/organisms/modal-notification'
  import { useModalNotification } from '@/components/organisms/modal-notification/useModalNotification'

  const { modalState, hideModal } = useModalNotification()
</script>
<template>
  <div
    class="flex h-screen w-full flex-col bg-slate-200/25 transition-colors duration-200 dark:bg-slate-950"
  >
    <ModalNotification
      :show="modalState.show"
      :type="modalState.type"
      :options="modalState.options"
      :on-close="hideModal"
    />
    <!-- Header (top, full width) -->
    <div class="relative z-20 flex-shrink-0">
      <DashboardHeader />
    </div>

    <!-- Body: sidebar + main -->
    <div class="flex min-h-0 flex-1">
      <!-- Sidebar (left) -->
      <aside class="w-72 flex-shrink-0 overflow-y-auto">
        <DashboardSidebar />
      </aside>

      <!-- Main content (right) -->
      <main class="flex-1 overflow-y-auto bg-slate-100/25 dark:bg-slate-950">
        <slot />
      </main>
    </div>
  </div>
</template>
