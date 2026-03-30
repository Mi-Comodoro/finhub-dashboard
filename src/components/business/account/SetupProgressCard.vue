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
        status: props.accountsCount > 0 ? (props.goalsCount > 3 ? 'success' : 'loading') : 'pending'
      },
      {
        id: 'distribution',
        label: 'Distribución de ahorro',
        status:
          props.goalsCount > 3
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
  <div class="rounded-xl shadow-sm">
    <!-- STEPS -->
    <div v-if="!isCompleted" class="space-y-1">
      <div v-for="step in steps" :key="step.id" class="flex items-center gap-3">
        <!-- ICON -->
        <div class="mt-1">
          <!-- loading -->
          <div
            v-if="step.status === 'loading'"
            class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-800"
          />
          <!-- success -->
          <div
            v-else-if="step.status === 'success'"
            class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-800 text-xs text-white"
          >
            ✓
          </div>

          <!-- pending -->
          <div v-else class="h-5 w-5 rounded-full border-2 border-gray-300 opacity-40" />
        </div>

        <!-- TEXT -->
        <div>
          <p class="text-xs font-medium text-neutral-300">
            {{ step.label }}
          </p>
        </div>
      </div>
    </div>
    <slot v-if="isCompleted" name="action" />
  </div>
</template>
