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
  <div :class="['flex h-full w-full items-center bg-white px-4 py-2 dark:bg-slate-900', className]">
    <div class="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between">
      <!-- Left section: hamburger (mobile) + back + breadcrumbs -->
      <div class="flex min-w-0 items-center gap-4">
        <Button
          icon="menu"
          variant="ghost"
          size="sm"
          :icon-only="true"
          class="lg:hidden"
          @click="toggle"
        />
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
  </div>
</template>
