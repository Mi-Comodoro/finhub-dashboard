<script setup lang="ts">
  import { onMounted } from 'vue'

  import { Button, Icon } from '@/components/atoms'
  import { Breadcrumbs, HeaderActions, SearchInput } from '@/components/molecules'
  import { useBreadcrumbNavigation } from '@/components/molecules/breadcrumbs/useBreadcrumbNavigation'
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
  <div :class="['flex h-full w-full items-center bg-white px-6 dark:bg-slate-900', className]">
    <div class="flex h-full w-full items-center justify-between">
      <!-- Left section: hamburger (mobile only) + back + breadcrumbs -->
      <div class="flex min-w-0 items-center gap-4">
        <div class="lg:hidden">
          <Button icon="menu" variant="ghost" size="sm" :icon-only="true" @click="toggle" />
        </div>

        <Icon
          v-if="route.path !== '/dashboard'"
          name="arrow_back"
          class="cursor-pointer text-neutral-500 transition-colors hover:text-primary-500"
          size="sm"
          @click="router.back()"
        />

        <Breadcrumbs :max-items="4" class="hidden xl:flex" />
      </div>

      <!-- Right section: Search + Actions -->
      <div class="flex items-center gap-6">
        <div class="hidden md:block">
          <SearchInput placeholder="Buscar Movimientos..." class="w-64" />
        </div>

        <!-- Header Actions -->
        <HeaderActions />
      </div>
    </div>
  </div>
</template>
