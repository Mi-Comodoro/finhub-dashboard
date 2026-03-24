<script setup lang="ts">
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  const plannedIncomeStore = usePlannedIncomeStore()
  const savingsAmount = computed(() => plannedIncomeStore.buckets.savingsAmount)
</script>

<template>
  <div class="relative z-10 flex flex-col gap-4 overflow-hidden">
    <Card class="flex !p-8">
      <div class="flex w-full items-start justify-between gap-2">
        <div class="flex gap-2">
          <div class="flex items-start gap-2">
            <IconBadge icon="account_balance" variant="secondary" />
          </div>
          <div class="space-y-2">
            <Label variant="section" text="Monto asignado para el Mes" color="muted" />
            <Heading color="black" size="5xl" weight="bold">
              {{ formatCurrency(savingsAmount, 'COP') }}
              <span class="text-sm uppercase text-slate-500">cop</span>
            </Heading>
          </div>
        </div>
        <div class="w-fit">
          <ProgressBar title="Progreso del Mes" :progress="50" />
        </div>
        <div class="place-items-end text-end">
          <Label variant="section" text="Restante por Asignar" color="muted" />
          <Text color="muted" size="sm" weight="bold">
            {{ formatCurrency(savingsAmount, 'COP') }}
          </Text>
        </div>
      </div>
    </Card>
    <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
      <span class="material-symbols-outlined rotate-12 !text-[150px] text-primary-500">
        savings
      </span>
    </div>
  </div>
</template>
