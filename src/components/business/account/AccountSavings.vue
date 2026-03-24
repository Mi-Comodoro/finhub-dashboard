<script setup lang="ts">
  import { CardInfo } from '@/components/molecules'
  import { useAccountSavings } from '@/composables/useAccountSavings'
  import { useAccountStore } from '@/stores/account.store'
  import { IconBadge } from '~/components/atoms'
  import type { CompoundingFrequency } from '~/types/api'

  const emit = defineEmits(['open-form'])
  const accountStore = useAccountStore()
  const { frequencyMap, getRateCategory } = useAccountSavings()

  const getRateClass = (annualRate: number) => {
    const { level } = getRateCategory(annualRate)

    // Mapeo de niveles a clases de Tailwind (o tus clases personalizadas)
    const classes: Record<string, string> = {
      Alta: 'bg-green-200 text-green-700', // Rendimiento superior
      Media: 'bg-blue-200 text-blue-700', // Competitivo
      Baja: 'bg-yellow-200 text-yellow-700', // Estándar
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
    if (level === 'Baja') return 'bg-yellow-200 text-yellow-700'
    if (level === 'Muy Baja') return 'bg-red-200 text-red-700'

    return 'bg-gray-200 text-gray-500'
  }
  const rentabiliies = ['Alta', 'Media', 'Baja', 'Muy Baja']
  onMounted(async () => {
    await accountStore.fetchAccounts()
  })
</script>
<template>
  <div class="h-full">
    <SectionCard
      title="Cuentas"
      icon="list_alt_add"
      icon-variant="secondary"
      class="h-full space-y-2 overflow-auto"
    >
      <template #action>
        <div class="flex items-center gap-2">
          <Badge variant="secondary" size="xs">{{ accountStore.accounts.length }} Activas</Badge>
        </div>
      </template>

      <div v-if="!accountStore.accounts" class="m-auto flex flex-col items-center space-y-2">
        <div class="flex flex-col items-center">
          <IconBadge icon="list_alt_add" />
          <Heading level="h3" size="lg" weight="semibold">Metas de Ahorro</Heading>
          <Text color="muted" size="sm" class="coming-soon-card__description">
            Aun no haz creado tus metas de Ahorro
          </Text>
        </div>
        <Button size="sm" @click="emit('open-form')">Crear</Button>
      </div>
      <div>
        <Card>
          <Text color="muted" size="xs" class="coming-soon-card__description">
            Identifica la rentabilidad de tus cuentas segun los colores
          </Text>

          <span
            v-for="(rentability, index) in rentabiliies"
            :key="index"
            class="mr-2 rounded-md px-2 py-0.5 text-xs font-semibold"
            :class="getLevelRateClass(rentability)"
          >
            {{ rentability }}
          </span>
        </Card>
      </div>
      <div v-for="(account, index) in accountStore.accounts" :key="index">
        <Card class-name="!p-2">
          <div class="flex w-full flex-col">
            <div class="flex items-center justify-between gap-2">
              <CardInfo
                level="h3"
                title-size="sm"
                weight="extrabold"
                :title="account.name"
                :sub-title="getRateCategory(Number(account.interestRate)).description"
                sub-title-size="xs"
                sub-title-color="muted"
              />
              <div class="flex items-center gap-2">
                <span
                  class="rounded-md px-2 py-0.5 text-xs font-semibold"
                  :class="getFrequencyClass(account.compoundingFrequency)"
                >
                  {{ frequencyMap(account.compoundingFrequency) }}
                </span>
                <span
                  class="rounded-md px-2 py-0.5 text-xs font-semibold"
                  :class="getRateClass(Number(account.interestRate))"
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
