<script setup lang="ts">
  import { useAccountStore } from '@/stores/account.store'
  const accountStore = useAccountStore()

  const emit = defineEmits(['open-form'])
</script>
<template>
  <div>
    <SectionCard
      title="Distribución de Ahorro"
      class="space-y-2"
      icon="donut_large"
      icon-variant="primary"
    >
      <template #action></template>

      <div class="flex h-96 flex-col place-content-center items-center space-y-2 p-4">
        <div class="flex flex-col items-center">
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
