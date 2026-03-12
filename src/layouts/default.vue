<script setup lang="ts">
  import { ModalNotification } from '@/components/organisms/modal-notification'
  import { useModalNotification } from '@/components/organisms/modal-notification/useModalNotification'

  const { modalState, hideModal } = useModalNotification()
</script>
<template>
  <div class="layout">
    <header class="layout-header">
      <nav class="navbar">
        <!-- Navbar content -->
      </nav>
    </header>

    <main class="layout-main">
      <aside class="sidebar">
        <!-- Sidebar content -->
      </aside>

      <div class="content">
        <router-view></router-view>
      </div>
    </main>

    <footer class="layout-footer">
      <!-- Footer content -->

      <ModalNotification
        :show="modalState.show"
        :type="modalState.type"
        :options="modalState.options"
        :on-close="hideModal"
      />
    </footer>
  </div>
</template>

<style scoped lang="postcss">
  .layout-header {
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  .layout-main {
    display: flex;
    flex: 1;
  }

  .sidebar {
    width: 250px;
    background-color: #fafafa;
    border-right: 1px solid #ddd;
  }

  .content {
    flex: 1;
    padding: 20px;
  }

  .layout-footer {
    background-color: #f5f5f5;
    border-top: 1px solid #ddd;
    padding: 20px;
    text-align: center;
  }
</style>
