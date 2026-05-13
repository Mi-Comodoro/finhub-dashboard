<script setup lang="ts">
  export type IllustrationType = 'no-transactions' | 'no-goals' | 'no-budget' | 'help'

  const props = withDefaults(
    defineProps<{
      type?: IllustrationType
    }>(),
    { type: 'no-transactions' }
  )
</script>

<template>
  <!-- No Transactions -->
  <svg
    v-if="props.type === 'no-transactions'"
    viewBox="0 0 200 160"
    xmlns="http://www.w3.org/2000/svg"
    class="empty-illustration"
    aria-hidden="true"
  >
    <!-- Background card -->
    <rect x="30" y="20" width="140" height="110" rx="12" class="empty-illustration__surface" />
    <!-- Card stripe -->
    <rect x="30" y="44" width="140" height="20" class="empty-illustration__primary-muted" />
    <!-- Chip -->
    <rect x="46" y="70" width="28" height="20" rx="4" class="empty-illustration__primary" />
    <!-- Lines -->
    <rect x="84" y="74" width="50" height="5" rx="2.5" class="empty-illustration__muted" />
    <rect x="84" y="83" width="34" height="5" rx="2.5" class="empty-illustration__muted-light" />
    <!-- X mark overlay -->
    <circle cx="148" cy="118" r="22" class="empty-illustration__surface-base" />
    <circle cx="148" cy="118" r="18" class="empty-illustration__danger-muted" />
    <line x1="140" y1="110" x2="156" y2="126" stroke-width="3" stroke-linecap="round" class="empty-illustration__danger-stroke" />
    <line x1="156" y1="110" x2="140" y2="126" stroke-width="3" stroke-linecap="round" class="empty-illustration__danger-stroke" />
  </svg>

  <!-- No Goals -->
  <svg
    v-else-if="props.type === 'no-goals'"
    viewBox="0 0 200 160"
    xmlns="http://www.w3.org/2000/svg"
    class="empty-illustration"
    aria-hidden="true"
  >
    <!-- Outer ring -->
    <circle cx="100" cy="78" r="52" class="empty-illustration__primary-muted" />
    <!-- Middle ring -->
    <circle cx="100" cy="78" r="36" class="empty-illustration__surface-base" />
    <!-- Inner ring -->
    <circle cx="100" cy="78" r="22" class="empty-illustration__secondary-muted" />
    <!-- Center dot -->
    <circle cx="100" cy="78" r="8" class="empty-illustration__secondary" />
    <!-- Arrow shaft -->
    <line x1="60" y1="120" x2="95" y2="82" stroke-width="3" stroke-linecap="round" class="empty-illustration__primary-stroke" />
    <!-- Arrow head -->
    <polyline points="85,80 95,82 93,92" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" class="empty-illustration__primary-stroke-poly" />
    <!-- Plus on center -->
    <line x1="100" y1="75" x2="100" y2="81" stroke-width="2" stroke-linecap="round" class="empty-illustration__surface-stroke" />
    <line x1="97" y1="78" x2="103" y2="78" stroke-width="2" stroke-linecap="round" class="empty-illustration__surface-stroke" />
  </svg>

  <!-- No Budget -->
  <svg
    v-else-if="props.type === 'no-budget'"
    viewBox="0 0 200 160"
    xmlns="http://www.w3.org/2000/svg"
    class="empty-illustration"
    aria-hidden="true"
  >
    <!-- Document body -->
    <rect x="50" y="15" width="100" height="128" rx="8" class="empty-illustration__surface" />
    <!-- Dog-ear fold -->
    <polygon points="120,15 150,45 120,45" class="empty-illustration__primary-muted" />
    <polygon points="120,15 150,45 120,45" fill="none" class="empty-illustration__surface-base" />
    <!-- Lines simulating text -->
    <rect x="64" y="56" width="60" height="6" rx="3" class="empty-illustration__primary" />
    <rect x="64" y="70" width="72" height="5" rx="2.5" class="empty-illustration__muted" />
    <rect x="64" y="82" width="56" height="5" rx="2.5" class="empty-illustration__muted-light" />
    <rect x="64" y="94" width="64" height="5" rx="2.5" class="empty-illustration__muted" />
    <!-- Dashed box (empty budget section) -->
    <rect x="64" y="108" width="72" height="22" rx="4" stroke-dasharray="4 3" stroke-width="1.5" fill="none" class="empty-illustration__muted-dash" />
    <line x1="100" y1="115" x2="100" y2="123" stroke-width="1.5" stroke-linecap="round" class="empty-illustration__muted-stroke" />
    <line x1="96" y1="119" x2="104" y2="119" stroke-width="1.5" stroke-linecap="round" class="empty-illustration__muted-stroke" />
  </svg>

  <!-- Help -->
  <svg
    v-else-if="props.type === 'help'"
    viewBox="0 0 200 160"
    xmlns="http://www.w3.org/2000/svg"
    class="empty-illustration"
    aria-hidden="true"
  >
    <!-- Background circle -->
    <circle cx="100" cy="76" r="58" class="empty-illustration__secondary-muted" />
    <!-- Inner circle -->
    <circle cx="100" cy="76" r="44" class="empty-illustration__surface-base" />
    <!-- Question mark stem -->
    <path
      d="M88 58 C88 48 112 48 112 62 C112 72 100 72 100 84"
      stroke-width="7"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      class="empty-illustration__secondary-stroke"
    />
    <!-- Question mark dot -->
    <circle cx="100" cy="96" r="4" class="empty-illustration__secondary" />
    <!-- Small decoration circles -->
    <circle cx="44" cy="46" r="6" class="empty-illustration__primary-muted" />
    <circle cx="156" cy="110" r="8" class="empty-illustration__primary-muted" />
    <circle cx="152" cy="40" r="4" class="empty-illustration__secondary-muted-dark" />
  </svg>
</template>

<style scoped lang="postcss">
  .empty-illustration {
    @apply w-full;
  }

  /* Surface / backgrounds */
  .empty-illustration__surface {
    fill: #f0fdfa; /* primary-50 */
  }

  .empty-illustration__surface-base {
    fill: #ffffff;
  }

  /* Primary (teal) */
  .empty-illustration__primary {
    fill: #14b8a6; /* primary-500 */
  }

  .empty-illustration__primary-muted {
    fill: #ccfbf1; /* primary-100 */
  }

  .empty-illustration__primary-stroke {
    stroke: #0d9488; /* primary-600 */
  }

  .empty-illustration__primary-stroke-poly {
    stroke: #0d9488;
  }

  /* Secondary (indigo) */
  .empty-illustration__secondary {
    fill: #6366f1; /* secondary-500 */
  }

  .empty-illustration__secondary-muted {
    fill: #e0e7ff; /* secondary-100 */
  }

  .empty-illustration__secondary-muted-dark {
    fill: #c7d2fe; /* secondary-200 */
  }

  .empty-illustration__secondary-stroke {
    stroke: #6366f1; /* secondary-500 */
  }

  /* Danger (red) */
  .empty-illustration__danger-muted {
    fill: #fee2e2; /* danger-100 */
  }

  .empty-illustration__danger-stroke {
    stroke: #ef4444; /* danger-500 */
  }

  /* Muted / neutral */
  .empty-illustration__muted {
    fill: #cbd5e1; /* neutral-300 */
  }

  .empty-illustration__muted-light {
    fill: #e2e8f0; /* neutral-200 */
  }

  .empty-illustration__muted-dash {
    stroke: #94a3b8; /* neutral-400 */
  }

  .empty-illustration__muted-stroke {
    stroke: #94a3b8; /* neutral-400 */
  }

  /* Surface stroke */
  .empty-illustration__surface-stroke {
    stroke: #ffffff;
  }
</style>
