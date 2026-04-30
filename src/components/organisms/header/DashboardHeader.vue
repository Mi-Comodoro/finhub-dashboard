<script setup lang="ts">
  import { onMounted } from 'vue'

  import { Icon } from '@/components/atoms'
  import { Breadcrumbs, HeaderActions, SearchInput } from '@/components/molecules'
  import { useBreadcrumbNavigation } from '@/components/molecules/breadcrumbs/useBreadcrumbNavigation'

  import type { DashboardHeaderProps } from './types/dashboard-header.types'
  const router = useRouter()
  const route = useRoute()

  // Initialize auto breadcrumb navigation
  useBreadcrumbNavigation({
    autoUpdate: true,
    homeLabel: 'Dashboard'
  })

  withDefaults(defineProps<DashboardHeaderProps>(), {
    title: '',
    className: ''
  })

  // Simulate last connection time - avoid SSR hydration mismatch

  onMounted(() => {})
</script>

<template>
  <header
    :class="[
      'fixed top-0 z-20 h-16 w-full border-b border-slate-200 bg-white px-4 py-2 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900',
      className
    ]"
  >
    <div class="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between">
      <!-- Last connections info -->
      <div class="flex min-w-0 items-center gap-4">
        <Icon
          v-if="route.path !== '/dashboard'"
          name="arrow_back"
          class="cursor-pointer text-neutral-500"
          size="sm"
          @click="router.back()"
        />
        <Breadcrumbs :max-items="4" class="hidden xl:flex" />
      </div>
      <div class="flex items-center gap-4">
        <div>
          <SearchInput placeholder="Buscar Movimientos..." />
        </div>
        <!-- Header Actions -->
        <HeaderActions />
      </div>
    </div>
  </header>
</template>
