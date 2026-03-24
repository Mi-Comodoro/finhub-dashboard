<script setup lang="ts">
  import { Button, Card, Icon, Label } from '~/components/atoms'
  import { AllocationSummary, SavingsDistribution } from '~/components/business'
  import { ModalWizard } from '~/components/organisms'

  definePageMeta({
    layout: 'dashboard',
    title: 'Planificacion de Ahorros',
    breadcrumb: 'Planificacion de Ahorros',
    parents: ['Presupuesto', 'Detalles']
  })
  const route = useRoute()
  const { fetchBudgetById } = useBudget()
  const { fetchPlannedIncomeByBudgetId } = usePlannedIncomes()

  const budgetId = route.params['id'] as string
  onMounted(async () => {
    await fetchBudgetById(budgetId)
    await fetchPlannedIncomeByBudgetId(budgetId)
  })

  const showAccountSavingsForm = ref(false)

  const createAccountSavings = () => {
    showAccountSavingsForm.value = true
  }
  const closeAccountSavings = () => {
    showAccountSavingsForm.value = false
  }

  const showSavingDistributionForm = ref(false)
  const createSavingDistributionForm = () => {
    showSavingDistributionForm.value = true
  }
  const closeSavingDistributionForm = () => {
    showSavingDistributionForm.value = false
  }
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
      <AllocationSummary />
      <div class="grid w-full gap-4">
        <div class="grid w-full grid-cols-2 gap-4">
          <SavingsDistribution @open-form="createSavingDistributionForm" />
          <div class="grid h-auto w-full grid-cols-[1fr_auto] gap-4">
            <AccountSavings @open-form="createAccountSavings" />
            <div class="grid gap-4">
              <Card class="relative h-fit w-64 space-y-4 overflow-hidden" class-name="!p-0">
                <div class="relative z-10 flex flex-col gap-4 p-4">
                  <div class="flex items-center gap-2">
                    <Icon name="lightbulb" size="md" class-name="text-secondary-600" />
                    <Heading
                      level="h1"
                      size="sm"
                      weight="extrabold"
                      color="secondary"
                      class="leading-tight"
                    >
                      Recomendaciones
                    </Heading>
                  </div>
                  <Text size="xs" color="black" class="flex items-center gap-1">
                    Hemos clasificado por colores los niveles de rentabilidad
                  </Text>

                  <Card class="!bg-secondary-100">
                    <Label title-size="xs" weight="bold" color="secondary">
                      Cuentas de Alta Rentabilidad
                    </Label>
                    <Text size="xs" color="secondary" class="flex items-start gap-1">> 10% EA</Text>
                    <Text size="xs" color="secondary" class="flex items-start gap-1">
                      <strong>
                        Uso:
                        <span class="font-normal">
                          Fondo de emergencia, ahorro a la vista y metas a corto plazo.
                        </span>
                      </strong>
                    </Text>
                  </Card>
                </div>
              </Card>
              <Card
                class="relative h-fit w-64 space-y-4 overflow-hidden !bg-primary-900"
                class-name="!p-0"
              >
                <div class="relative z-10 flex flex-col gap-4 p-4">
                  <CardInfo
                    level="h3"
                    title-size="sm"
                    color="white"
                    weight="extrabold"
                    title="Necesitas una nueva cuenta de Referencia"
                    sub-title="Configura un perfil de cuenta para simular tus metas futuras sin comprometer fondos reales."
                    sub-title-size="xs"
                    sub-title-color="white"
                    vertical-space
                  />
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="!text-primary-900"
                      @click="createAccountSavings"
                    >
                      Configurar ahora
                    </Button>
                  </div>
                </div>
                <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
                  <span class="material-symbols-outlined rotate-12 !text-[150px] text-white">
                    credit_card
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ModalWizard v-model:show="showAccountSavingsForm">
      <AccountSavingForm @on-close="closeAccountSavings" />
    </ModalWizard>

    <ModalWizard v-model:show="showSavingDistributionForm">
      <SavingDistributionForm @on-close="closeSavingDistributionForm" />
    </ModalWizard>
  </div>
</template>
