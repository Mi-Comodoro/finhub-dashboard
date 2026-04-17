<script setup lang="ts">
  import { computed, watch } from 'vue'

  interface Props {
    accountsCount: number
    goalsCount: number
    distributionPercentage: number
  }

  const props = defineProps<Props>()

  const emit = defineEmits(['completed'])

  // 🧠 lógica central
  const steps = computed(() => {
    return [
      {
        id: 'accounts',
        label: 'Cuentas configuradas',
        status: props.accountsCount > 0 ? 'success' : 'loading'
      },
      {
        id: 'goals',
        label: 'Metas creadas',
        status:
          props.accountsCount > 0 ? (props.goalsCount >= 3 ? 'success' : 'loading') : 'pending'
      },
      {
        id: 'distribution',
        label: 'Distribución de ahorro',
        status:
          props.goalsCount >= 3
            ? props.distributionPercentage === 100
              ? 'success'
              : 'loading'
            : 'pending'
      }
    ]
  })
  // 🚀 cuando todo está listo
  const isCompleted = computed(() => steps.value.every(step => step.status === 'success'))

  watch(isCompleted, val => {
    if (val) emit('completed')
  })
</script>

<template>
  <div class="setup-progress-card">
    <!-- STEPS -->
    <div v-if="!isCompleted" class="setup-progress-card__steps">
      <div v-for="step in steps" :key="step.id" class="setup-progress-card__step">
        <!-- ICON -->
        <div class="setup-progress-card__icon-wrapper">
          <!-- loading -->
          <div
            v-if="step.status === 'loading'"
            class="setup-progress-card__icon setup-progress-card__icon--loading"
          />
          <!-- success -->
          <div
            v-else-if="step.status === 'success'"
            class="setup-progress-card__icon setup-progress-card__icon--success"
          >
            ✓
          </div>

          <!-- pending -->
          <div v-else class="setup-progress-card__icon setup-progress-card__icon--pending" />
        </div>

        <!-- TEXT -->
        <div>
          <p class="setup-progress-card__label">
            {{ step.label }}
          </p>
        </div>
      </div>
    </div>
    <slot v-if="isCompleted" name="action" />
  </div>
</template>

<style scoped lang="postcss">
.setup-progress-card {
  @apply rounded-xl shadow-sm;
}

.setup-progress-card__steps {
  @apply space-y-1;
}

.setup-progress-card__step {
  @apply flex items-center gap-3;
}

.setup-progress-card__icon-wrapper {
  @apply mt-1;
}

.setup-progress-card__icon {
  @apply h-5 w-5 rounded-full;
}

.setup-progress-card__icon--loading {
  @apply animate-spin border-2 border-gray-300 border-t-primary-800;
}

.setup-progress-card__icon--success {
  @apply flex items-center justify-center bg-primary-800 text-xs text-white;
}

.setup-progress-card__icon--pending {
  @apply border-2 border-gray-300 opacity-40;
}

.setup-progress-card__label {
  @apply text-xs font-medium text-neutral-300;
}
</style>
