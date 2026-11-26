<script setup lang="ts">
  import { onMounted } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import Icon from '@/components/atoms/icons/Icon.vue'
  import Breadcrumbs from '@/components/molecules/breadcrumbs/Breadcrumbs.vue'
  import { useBreadcrumbNavigation } from '@/components/molecules/breadcrumbs/useBreadcrumbNavigation'
  import HeaderActions from '@/components/molecules/header/HeaderActions.vue'
  import SearchInput from '@/components/molecules/input/SearchInput.vue'
  import { useSidebar } from '@/composables/useSidebar'

  import type { DashboardHeaderProps } from './types/dashboard-header.types'
  const router = useRouter()
  const route = useRoute()
  const { toggle } = useSidebar()

  // Initialize auto breadcrumb navigation
  useBreadcrumbNavigation({
    autoUpdate: true,
    homeLabel: 'Dashboard'
  })

  withDefaults(defineProps<DashboardHeaderProps>(), {
    title: '',
    className: ''
  })

  onMounted(() => {})
</script>

<template>
  <div :class="['dashboard-header', className]">
    <div class="dashboard-header__inner">
      <!-- Left section: hamburger (mobile only) + back + breadcrumbs -->
      <div class="dashboard-header__left">
        <div class="dashboard-header__menu">
          <Button icon="menu" variant="ghost" size="sm" :icon-only="true" @click="toggle" />
        </div>

        <Icon
          v-if="route.path !== '/dashboard' && route.path !== '/admin'"
          name="arrow_back"
          class="dashboard-header__back"
          size="sm"
          @click="router.back()"
        />

        <Breadcrumbs :max-items="4" class="dashboard-header__breadcrumbs" />
      </div>

      <!-- Right section: Search + Actions -->
      <div class="dashboard-header__right">
        <div class="dashboard-header__search">
          <SearchInput placeholder="Buscar Movimientos..." />
        </div>

        <!-- Header Actions -->
        <HeaderActions />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .dashboard-header {
    @apply flex h-full w-full items-center bg-transparent px-6;
  }

  .dashboard-header__inner {
    @apply flex h-full w-full items-center justify-between;
  }

  .dashboard-header__left {
    @apply flex min-w-0 items-center gap-4;
  }

  .dashboard-header__menu {
    @apply lg:hidden;
  }

  .dashboard-header__back {
    @apply cursor-pointer text-neutral-500 transition-colors hover:text-primary-500;
  }

  .dashboard-header__breadcrumbs {
    @apply hidden xl:flex;
  }

  .dashboard-header__right {
    @apply flex items-center gap-6;
  }

  .dashboard-header__search {
    @apply hidden md:block;
  }
</style>
