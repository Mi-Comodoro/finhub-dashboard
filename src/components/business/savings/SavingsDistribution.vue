<script setup lang="ts">
  import { useAccountStore } from '@/stores/account.store'
  const accountStore = useAccountStore()

  const emit = defineEmits(['open-form'])
</script>
<template>
  <div>
    <SectionCard
      title="Distribución de Ahorro"
      class="savings-distribution__card"
      icon="donut_large"
      icon-variant="primary"
    >
      <template #action></template>

      <div class="savings-distribution__content">
        <div class="savings-distribution__info">
          <IconBadge icon="strategy" container-class="coming-soon-card__icon" />
          <Heading level="h3" size="lg" weight="semibold">Distribucion de Ahorro</Heading>
          <Text color="muted" size="xs">Necesitas crear cuantas para vincular tus metas</Text>
        </div>
        <div>
          <Button :disabled="accountStore.accounts.length < 1" size="sm" @click="emit('open-form')">
            Crear
          </Button>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<style scoped lang="postcss">
  .savings-distribution__card {
    @apply space-y-2;
  }

  .savings-distribution__content {
    @apply flex h-96 flex-col place-content-center items-center space-y-2 p-4;
  }

  .savings-distribution__info {
    @apply flex flex-col items-center;
  }
</style>
