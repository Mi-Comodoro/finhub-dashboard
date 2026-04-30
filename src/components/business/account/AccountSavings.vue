<script setup lang="ts">
  import { CardInfo } from '@/components/molecules'
  import { useAccountSavingsApplication } from '@/composables/application/useAccountSavingsApplication'
  import { IconBadge } from '~/components/atoms'
  import type { CompoundingFrequency } from '~/types/api'

  const emit = defineEmits(['open-form'])
  const { frequencyMap, getRateCategory, accounts } = useAccountSavingsApplication()

  const getRateClass = (annualRate: number) => {
    const { level } = getRateCategory(annualRate)

    // Mapeo de niveles a clases de Tailwind (o tus clases personalizadas)
    const classes: Record<string, string> = {
      Alta: 'bg-green-200 text-green-700', // Rendimiento superior
      Media: 'bg-blue-200 text-blue-700', // Competitivo
      Baja: 'bg-warning-200 text-warning-700', // Estándar
      'Muy Baja': 'bg-red-200 text-red-700' // Casi nulo
    }

    return classes[level] || 'bg-gray-200 text-gray-500'
  }

  const getFrequencyClass = (frequency: CompoundingFrequency) => {
    const classes: Record<CompoundingFrequency, string> = {
      daily: 'bg-orange-100 text-orange-600', // Diario (Alta actividad)
      monthly: 'bg-indigo-100 text-indigo-600', // Mensual (Estándar)
      annually: 'bg-emerald-100 text-emerald-600' // Anual (Largo plazo)
    }
    return classes[frequency] || 'bg-gray-100 text-gray-600'
  }
  const getLevelRateClass = (level: string) => {
    if (level === 'Alta') return 'bg-green-200 text-green-700'
    if (level === 'Media') return 'bg-blue-200 text-blue-700'
    if (level === 'Baja') return 'bg-warning-200 text-warning-700'
    if (level === 'Muy Baja') return 'bg-red-200 text-red-700'

    return 'bg-gray-200 text-gray-500'
  }
  const rentabiliies = ['Alta', 'Media', 'Baja', 'Muy Baja']
</script>
<template>
  <div class="account-savings">
    <SectionCard
      title="Cuentas"
      icon="list_alt_add"
      icon-variant="secondary"
      class="account-savings__section"
    >
      <template #action>
        <div class="account-savings__action">
          <Badge variant="secondary" size="xs">{{ accounts?.length ?? 0 }} Activas</Badge>
        </div>
      </template>

      <div v-if="!accounts || accounts.length === 0" class="account-savings__empty">
        <div class="account-savings__empty-content">
          <IconBadge icon="list_alt_add" />
          <Heading level="h3" size="lg" weight="semibold">Metas de Ahorro</Heading>
          <Text color="muted" size="sm" class="account-savings__empty-description">
            Aun no haz creado tus metas de Ahorro
          </Text>
        </div>
        <Button size="sm" @click="emit('open-form')">Crear</Button>
      </div>
      <div>
        <Card>
          <Text color="muted" size="xs" class="account-savings__legend-description">
            Identifica la rentabilidad de tus cuentas segun los colores
          </Text>

          <span
            v-for="(rentability, index) in rentabiliies"
            :key="index"
            class="account-savings__legend-badge"
            :class="getLevelRateClass(rentability)"
          >
            {{ rentability }}
          </span>
        </Card>
      </div>
      <div v-for="(account, index) in accounts" :key="index">
        <Card class-name="!p-2">
          <div class="account-savings__card">
            <div class="account-savings__card-header">
              <CardInfo
                level="h3"
                title-size="xl"
                weight="extrabold"
                :title="account.name"
                :sub-title="getRateCategory(account.interestRate ?? 0).description"
                sub-title-size="xs"
                sub-title-color="muted"
              />
              <div class="account-savings__card-badges">
                <span
                  class="account-savings__badge"
                  :class="getFrequencyClass(account.compoundingFrequency)"
                >
                  {{ frequencyMap(account.compoundingFrequency) }}
                </span>
                <span
                  class="account-savings__badge"
                  :class="getRateClass(account.interestRate ?? 0)"
                >
                  {{ account.interestRate.toFixed(2) }}% EA
                </span>
              </div>
            </div>

            <Text v-if="account.description" size="sm" color="muted">
              {{ account.description }}
            </Text>
          </div>
        </Card>
      </div>
      <template #footer></template>
    </SectionCard>
  </div>
</template>

<style scoped lang="postcss">
.account-savings {
  @apply h-full;
}

.account-savings__section {
  @apply h-full space-y-2 overflow-auto;
}

.account-savings__action {
  @apply flex items-center gap-2;
}

.account-savings__empty {
  @apply m-auto flex flex-col items-center space-y-2;
}

.account-savings__empty-content {
  @apply flex flex-col items-center;
}

.account-savings__empty-description {
  /* coming-soon-card__description class preserved */
}

.account-savings__legend-description {
  /* coming-soon-card__description class preserved */
}

.account-savings__legend-badge {
  @apply mr-2 rounded-md px-2 py-0.5 text-xs font-semibold;
}

.account-savings__card {
  @apply flex w-full flex-col;
}

.account-savings__card-header {
  @apply flex items-center justify-between gap-2;
}

.account-savings__card-badges {
  @apply flex items-center gap-2;
}

.account-savings__badge {
  @apply rounded-md px-2 py-0.5 text-xs font-semibold;
}
</style>
