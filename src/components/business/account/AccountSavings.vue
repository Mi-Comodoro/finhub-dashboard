<script setup lang="ts">
  import { CardInfo } from '@/components/molecules'
  import { useAccountSavingsApplication } from '@/composables/application/useAccountSavingsApplication'
  import { IconBadge } from '~/components/atoms'
  import type { CompoundingFrequency } from '~/types/api'

  const emit = defineEmits(['open-form'])
  const { frequencyMap, getRateCategory, accounts } = useAccountSavingsApplication()

  function rateVariant(level: string): string {
    const map: Record<string, string> = {
      Alta: 'success',
      Media: 'secondary',
      Baja: 'warning',
      'Muy Baja': 'danger'
    }
    return map[level] ?? 'default'
  }

  function frequencyVariant(frequency: CompoundingFrequency): string {
    const map: Record<CompoundingFrequency, string> = {
      daily: 'warning',
      monthly: 'secondary',
      annually: 'success'
    }
    return map[frequency] ?? 'default'
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

          <Badge
            v-for="(rentability, index) in rentabiliies"
            :key="index"
            :variant="rateVariant(rentability)"
            size="xs"
          >
            {{ rentability }}
          </Badge>
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
                <Badge :variant="frequencyVariant(account.compoundingFrequency)" size="xs">
                  {{ frequencyMap(account.compoundingFrequency) }}
                </Badge>
                <Badge
                  :variant="rateVariant(getRateCategory(account.interestRate ?? 0).level)"
                  size="xs"
                >
                  {{ account.interestRate.toFixed(2) }}% EA
                </Badge>
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

  .account-savings__card {
    @apply flex w-full flex-col;
  }

  .account-savings__card-header {
    @apply flex items-center justify-between gap-2;
  }

  .account-savings__card-badges {
    @apply flex items-center gap-2;
  }
</style>
