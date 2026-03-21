<script setup lang="ts">
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  import { MetricCard } from '~/components/atoms'

  definePageMeta({
    layout: 'dashboard',
    title: 'Planificacion de Ahorros',
    breadcrumb: 'Planificacion de Ahorros',
    parents: ['Presupuesto', 'Detalles']
  })

  const plannedIncomeStore = usePlannedIncomeStore()
  const savingsAmount = computed(() => plannedIncomeStore.buckets.savingsAmount)
</script>

<template>
  <div class="flex w-full flex-wrap items-start p-4">
    <div class="w-full flex-col space-y-4">
      <div class="flex items-center gap-2">
        <div class="flex flex-col">
          <div class="flex flex-wrap items-center gap-2">
            <Heading level="h1" size="2xl" weight="extrabold" class="leading-tight">
              Planificacion de Ahorros
            </Heading>
          </div>

          <Text size="sm" color="muted" class="flex items-center gap-1">
            Has destinado
            <strong>20%</strong>
            para tu ahorro mensual
          </Text>
        </div>
      </div>

      <div class="grid w-full gap-4 xl:grid-cols-2">
        <Card class="space-y-2 !bg-secondary-600">
          <div>
            <Text color="white" weight="bold" size="sm" class-name="uppercase">
              Monto asignado para el Ahorro Mensual
            </Text>
            <Heading
              level="h1"
              color="white"
              weight="extrabold"
              size="5xl"
              class-name="uppercase py-5"
            >
              {{ formatCurrency(savingsAmount, 'COP') }}
            </Heading>
          </div>
          <div class="grid gap-2 lg:grid-cols-2">
            <MetricCard
              title="Progreso del Mes"
              icon="savings"
              icon-class="text-yellow-600 bg-yellow-100"
            >
              <template #content>
                <ProgressBar :progress="50" />
              </template>
            </MetricCard>
            <MetricCard
              :value="savingsAmount"
              title="Restante por Asignar"
              subtitle="Disponible"
              icon="wallet"
              icon-class="text-primary-600 bg-primary-100"
            />
          </div>
        </Card>
        <div class="grid w-full gap-4 lg:grid-cols-2">
          <SectionCard title="Cuentas Utilizadas" class="space-y-2">
            <template #action>
              <Icon name="bolt" class="text-yellow-400" size="sm" />
            </template>

            <div class="m-auto flex flex-col items-center">
              <IconChip icon="savings" container-class="coming-soon-card__icon" />
              <Heading level="h3" size="lg" weight="semibold">Metas de Ahorro</Heading>
              <Text color="muted" size="sm" class="coming-soon-card__description">
                Aun no haz creado tus metas de Ahorro
              </Text>
              <div class="pt-4">
                <Button variant="secondary" size="sm">Crear Metas de Ahorro</Button>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Cuentas Utilizadas" class="space-y-2">
            <template #action>
              <Icon name="bolt" class="text-yellow-400" size="sm" />
            </template>

            <div class="m-auto flex flex-col items-center">
              <IconChip icon="savings" container-class="coming-soon-card__icon" />
              <Heading level="h3" size="lg" weight="semibold">Metas de Ahorro</Heading>
              <Text color="muted" size="sm" class="coming-soon-card__description">
                Aun no haz creado tus metas de Ahorro
              </Text>
              <div class="pt-4">
                <Button variant="secondary" size="sm">Crear Metas de Ahorro</Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
      <div class="grid w-full gap-4 lg:grid-cols-2">
        <SectionCard
          title="Cuentas Utilizadas"
          icon="account_balance"
          icon-variant="primary"
          class="space-y-2"
        >
          <template #action>
            <Button size="sm">Crear Cuentas</Button>
          </template>

          <div class="m-auto flex flex-col items-center">
            <IconChip icon="savings" container-class="coming-soon-card__icon" />
            <Heading level="h3" size="lg" weight="semibold">Metas de Ahorro</Heading>
            <Text color="muted" size="sm" class="coming-soon-card__description">
              Aun no haz creado tus metas de Ahorro
            </Text>
          </div>
        </SectionCard>
        <SectionCard title="Metas del Mes" class="space-y-2">
          <template #action>
            <Button size="sm">Crear Meta</Button>
          </template>

          <div class="m-auto flex flex-col items-center p-4">
            <IconChip icon="account_balance" container-class="coming-soon-card__icon" />
            <Heading level="h3" size="lg" weight="semibold">Metas de Ahorro</Heading>
            <Text color="muted" size="sm" class="coming-soon-card__description">
              Necesitas crear cuantas para vincular tus metas
            </Text>
          </div>
        </SectionCard>
      </div>
    </div>
  </div>
</template>
