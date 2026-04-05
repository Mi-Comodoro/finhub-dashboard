<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import { AlertBanner, Badge, Heading, Icon, Text } from '@/components/atoms'
  import { useSavingPlanned } from '@/composables/useSavingsPlanned'
  import { useFinancesStore } from '@/stores/finances.store'
  import { useToast } from '~/components/organisms/toast/useToast'
  import type { PlannedSavingSummary } from '~/types/domain'
  import DateUtils from '~/utils/date'

  const props = defineProps<{
    budgetId: string
  }>()

  const financesStore = useFinancesStore()

  const {
    isLoading,
    savingsPending,
    markAsCompleted,
    fetchByBudget,
    savingProgress,
    savingsAmount
  } = useSavingPlanned()
  const { show } = useToast()

  // ------------------------------------------------------------------
  // Datos y lógica de agrupación
  // ------------------------------------------------------------------
  const items = computed(() => savingsPending.value ?? [])

  const currency = computed(() => financesStore.defaultCurrency)
  const itemsByGroup = computed(() => {
    const groups: Record<string, PlannedSavingSummary[]> = {}
    for (const item of items.value) {
      const source = item.plannedIncome?.source ?? 'Sin fuente'
      if (!groups[source]) groups[source] = []
      groups[source].push(item)
    }
    return groups
  })

  // Estado de colapso (true = colapsado, false = expandido)
  const collapsedGroups = ref<Record<string, boolean>>({})

  // Inicializar todos los grupos como expandidos
  const initCollapsedState = () => {
    const state: Record<string, boolean> = {}
    const sources = Object.keys(itemsByGroup.value)
    sources.forEach((source, index) => {
      state[source] = index !== 0 // primero expandido, el resto colapsado
    })
    collapsedGroups.value = state
  }

  // Alternar colapso
  const toggleGroup = (source: string) => {
    collapsedGroups.value[source] = !collapsedGroups.value[source]
  }

  // Total pendiente por grupo
  const pendingAmountByGroup = (source: string) => {
    return items.value
      .filter(
        item => item.status === 'pending' && (item.plannedIncome?.source ?? 'Sin fuente') === source
      )
      .reduce((sum, item) => sum + Number(item.amount), 0)
  }

  // ------------------------------------------------------------------
  // Estilos para íconos según la razón de la meta
  // ------------------------------------------------------------------
  const reasonTextMap: Record<string, string> = {
    emergency: 'text-red-600',
    elderly: 'text-amber-600',
    home: 'text-orange-600',
    school: 'text-blue-600',
    flight: 'text-sky-600',
    medical_services: 'text-rose-600',
    payments: 'text-green-600',
    trending_up: 'text-emerald-600',
    directions_car: 'text-indigo-600',
    shopping_cart: 'text-purple-600'
  }

  const reasonBgMap: Record<string, string> = {
    emergency: 'bg-red-100',
    elderly: 'bg-amber-100',
    home: 'bg-orange-100',
    school: 'bg-blue-100',
    flight: 'bg-sky-100',
    medical_services: 'bg-rose-100',
    payments: 'bg-green-100',
    trending_up: 'bg-emerald-100',
    directions_car: 'bg-indigo-100',
    shopping_cart: 'bg-purple-100'
  }

  const getIconClasses = (reason: string | undefined) => {
    if (!reason) return 'rounded-md p-2 bg-gray-100 text-gray-600'
    const textClass = reasonTextMap[reason] || 'text-gray-600'
    const bgClass = reasonBgMap[reason] || 'bg-gray-100'
    return `rounded-md p-2 ${bgClass} ${textClass}`
  }

  // ------------------------------------------------------------------
  // Acciones
  // ------------------------------------------------------------------
  const done = async (itemId: string) => {
    const success = await markAsCompleted(itemId)
    if (success) {
      show({
        type: 'success',
        title: 'Operacion Exitosa',
        description: 'Abono Realizado con Exito!'
      })
    }
  }
  const loadItems = async () => {
    if (!props.budgetId) return
    await fetchByBudget(props.budgetId)
    initCollapsedState()
  }

  onMounted(loadItems)
  watch(
    () => props.budgetId,
    async (budgetId, previousBudgetId) => {
      if (budgetId && budgetId !== previousBudgetId) await loadItems()
    }
  )
</script>

<template>
  <SectionCard
    icon="savings"
    icon-variant="primary"
    title="Plan de Ahorro"
    sub-title="20% del total de tus Ingresos"
  >
    <template #action>
      <div class="flex items-center gap-2">
        <Badge>{{ savingsPending?.length }} Pendientes</Badge>
        <Text size="xs">
          {{ savingProgress }}% Ejecutado de
          <Badge variant="info">{{ formatCurrency(savingsAmount, currency) }}</Badge>
        </Text>
      </div>
    </template>
    <AlertBanner variant="warning" icon="info">
      Tu ahorro se activa con cada ingreso: apartamos el 20% cuando recibes dinero, para mantener tu
      plan en marcha de forma real y constante.
    </AlertBanner>
    <!-- Estado de carga -->
    <div v-if="isLoading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="animate-pulse rounded-md border border-slate-100 bg-slate-50 p-4"
      >
        <div class="mb-3 h-4 w-40 rounded bg-slate-200"></div>
        <div class="mb-2 h-3 w-28 rounded bg-slate-200"></div>
        <div class="h-3 w-24 rounded bg-slate-200"></div>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-else-if="items.length === 0" class="flex flex-col items-center gap-3 py-10 text-center">
      <Icon name="savings" size="2xl" class="text-slate-300" />
      <Heading level="h3" size="lg" color="muted">No hay ahorros planeados</Heading>
      <Text size="sm" color="muted">
        Cuando existan programaciones de ahorro para este presupuesto, aparecerán aquí.
      </Text>
    </div>

    <!-- Lista de grupos colapsables -->
    <div v-else class="space-y-3">
      <div
        v-for="(groupItems, source) in itemsByGroup"
        :key="source"
        class="rounded-md border border-slate-200 bg-white"
      >
        <!-- Cabecera clickeable -->
        <div
          class="flex cursor-pointer items-center justify-between gap-2 p-4 transition-colors hover:bg-slate-50"
          @click="toggleGroup(source)"
        >
          <div class="flex min-w-0 items-center gap-2">
            <Icon
              :name="collapsedGroups[source] ? 'chevron_right' : 'expand_more'"
              size="md"
              class="shrink-0 text-slate-500"
            />
            <Heading level="h3" size="sm" class="truncate">
              {{ translate[source] || source }}
            </Heading>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <Badge variant="info" size="xs" class="hidden sm:inline-flex">
              {{ formatCurrency(pendingAmountByGroup(source), financesStore.defaultCurrency) }}
            </Badge>
            <Badge size="xs">
              {{ groupItems.length }} {{ groupItems.length === 1 ? 'meta' : 'metas' }}
            </Badge>
          </div>
        </div>

        <!-- Contenido colapsable con animación -->
        <Transition name="collapse">
          <div v-show="!collapsedGroups[source]" class="border-t border-slate-100 p-4 pt-2">
            <div class="space-y-4">
              <!-- Item interno — mejorado -->
              <div
                v-for="item in groupItems"
                :key="item.id"
                class="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0 last:pb-0"
              >
                <!-- Izquierda: ícono + nombre + cuenta -->
                <div class="flex min-w-0 items-center gap-3">
                  <Icon
                    :name="item.savingGoal?.reason as string"
                    size="2xl"
                    :class-name="getIconClasses(item.savingGoal?.reason)"
                  />
                  <div class="min-w-0">
                    <Heading level="h3" size="sm" weight="extrabold" class="truncate">
                      {{ (item.savingGoal?.name || 'Meta sin nombre').toUpperCase() }}
                    </Heading>
                    <Text size="xs" color="muted" class="truncate">
                      {{ item.account?.name ?? 'Cuenta no definida' }}
                    </Text>
                  </div>
                </div>

                <!-- Derecha: monto + fecha + acciones -->
                <div class="flex shrink-0 items-center gap-3">
                  <div class="hidden text-right sm:block">
                    <Text size="sm" weight="bold" class="whitespace-nowrap">
                      {{ formatCurrency(item.amount, financesStore.defaultCurrency) }}
                    </Text>
                    <Text size="xs" color="muted" class="whitespace-nowrap">
                      {{ DateUtils.formatDate(item.date) }}
                    </Text>
                  </div>
                  <!-- En mobile solo el monto, sin fecha -->
                  <Text size="sm" weight="bold" class="whitespace-nowrap sm:hidden">
                    {{ formatCurrency(item.amount, financesStore.defaultCurrency) }}
                  </Text>
                  <div class="flex gap-2">
                    <Button
                      v-if="item.status === 'pending'"
                      icon="check"
                      size="sm"
                      icon-only
                      @click.stop="done(item.id)"
                    />
                    <Button icon="skip_next" size="sm" icon-only />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </SectionCard>
</template>

<style scoped>
  /* Animación suave para el colapso */
  .collapse-enter-active,
  .collapse-leave-active {
    transition: all 0.25s ease-out;
    overflow: hidden;
  }
  .collapse-enter-from,
  .collapse-leave-to {
    opacity: 0;
    max-height: 0;
  }
  .collapse-enter-to,
  .collapse-leave-from {
    opacity: 1;
    max-height: 1000px; /* suficientemente grande para el contenido */
  }
</style>
