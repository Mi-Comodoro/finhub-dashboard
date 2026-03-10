<script setup lang="ts">
  /**
   * Design Preview — Typography & Spacing Proposal
   * READ ONLY / dev-only page. Does not modify any existing component.
   *
   * Analyzes current typography usage and proposes changes to fonts, scale, line-heights,
   * color tokens, and spacing rhythm.
   * No existing file is modified until the team gives the GO.
   */
  import { ref } from 'vue'

  definePageMeta({ layout: false })

  const darkMode = ref(false)
  const activeTab = ref<'diagnosis' | 'scale' | 'spacing' | 'audit'>('diagnosis')

  /* ────────────────────────────────────────────────────────
   * Issues found
   * ──────────────────────────────────────────────────────── */
  const issues = [
    {
      severity: 'high',
      file: 'Heading.vue / Text.vue',
      issue: 'text-gray-* vs text-slate-*',
      detail:
        'Las superficies del sistema ya usan slate-*. Los componentes de texto siguen usando gray-900 / gray-700 / gray-600 / gray-400. Rompe coherencia visual en light mode (gris neutro vs gris azulado).'
    },
    {
      severity: 'high',
      file: 'tailwind.config.ts',
      issue: 'Sin font-family definida',
      detail:
        'No hay fontFamily en la config. El browser usa Arial (Windows) / Helvetica (macOS). Inter es la fuente estándar de dashboards financieros: legibilidad superior en números y tablas.'
    },
    {
      severity: 'medium',
      file: 'Heading.vue',
      issue: 'leading-normal fijo en todos los tamaños',
      detail:
        'line-height 1.5 en h1/h2/h3 grandes (2xl–4xl) es demasiado suelto. Los headings grandes necesitan leading-tight (1.25) para verse compactos y jerárquicos.'
    },
    {
      severity: 'medium',
      file: 'Text.vue',
      issue: 'leading-normal como default en párrafos',
      detail:
        'El default es leading-normal (1.5). Para párrafos de cuerpo la legibilidad óptima está en leading-relaxed (1.625). La diferencia es visible en textos de más de 2 líneas.'
    },
    {
      severity: 'medium',
      file: 'Text.vue',
      issue: 'Falta color "white"',
      detail:
        'Heading.vue tiene white: "text-white". Text.vue no lo tiene. El MetricCard variant="available" pasa color="white" al Heading pero no puede pasarlo al Text. API inconsistente.'
    },
    {
      severity: 'low',
      file: 'OnboardingWizard.vue',
      issue: 'Tags HTML crudos en lugar de componentes',
      detail:
        '<h1 class="text-4xl font-bold"> y <p class="text-lg text-gray-500"> bypasean el sistema de componentes. Cuando se cambie la escala, estos no se actualizarán.'
    },
    {
      severity: 'low',
      file: 'Sistema global',
      issue: 'Sin escala semántica documentada',
      detail:
        'Los props exponen xs|sm|base|lg|xl|2xl|3xl|4xl pero no hay mapa de roles: ¿qué tamaño es un page-title? ¿un card-title? Cada desarrollador adivina y el resultado es inconsistente.'
    }
  ]

  const severityLabel: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  }

  /* ────────────────────────────────────────────────────────
   * Type scale — current vs proposed
   * ──────────────────────────────────────────────────────── */
  const typeScale = [
    {
      role: 'Page Title',
      current: { size: '3xl', weight: 'bold', leading: 'normal (1.5)', color: 'gray-900' },
      proposed: { size: '2xl', weight: 'extrabold', leading: 'tight (1.25)', color: 'slate-900' },
      example: 'Dashboard Financiero'
    },
    {
      role: 'Section Title',
      current: { size: 'xl', weight: 'semibold', leading: 'normal (1.5)', color: 'gray-900' },
      proposed: { size: 'xl', weight: 'semibold', leading: 'tight (1.25)', color: 'slate-900' },
      example: 'Resumen del Mes'
    },
    {
      role: 'Card Title',
      current: { size: 'lg', weight: 'semibold', leading: 'normal (1.5)', color: 'gray-900' },
      proposed: { size: 'lg', weight: 'semibold', leading: 'snug (1.375)', color: 'slate-900' },
      example: 'Estado del Presupuesto'
    },
    {
      role: 'Body Text',
      current: { size: 'base', weight: 'normal', leading: 'normal (1.5)', color: 'gray-900' },
      proposed: { size: 'base', weight: 'normal', leading: 'relaxed (1.625)', color: 'slate-900' },
      example:
        'Conoce el estado de tus finanzas y toma decisiones inteligentes con datos en tiempo real.'
    },
    {
      role: 'Body Muted',
      current: { size: 'base', weight: 'normal', leading: 'normal (1.5)', color: 'gray-600' },
      proposed: { size: 'base', weight: 'normal', leading: 'relaxed (1.625)', color: 'slate-500' },
      example: 'Información secundaria o de apoyo para el usuario.'
    },
    {
      role: 'Caption / Small',
      current: { size: 'sm', weight: 'normal', leading: 'normal (1.5)', color: 'gray-600' },
      proposed: { size: 'sm', weight: 'normal', leading: 'snug (1.375)', color: 'slate-500' },
      example: 'Última actualización: hace 5 min'
    },
    {
      role: 'Overline / Label',
      current: { size: 'xs', weight: 'semibold', leading: 'normal (1.5)', color: 'gray-600' },
      proposed: { size: 'xs', weight: 'semibold', leading: 'normal (1.5)', color: 'slate-500' },
      example: 'MENÚ PRINCIPAL'
    }
  ]

  /* ────────────────────────────────────────────────────────
   * Spacing rhythm
   * ──────────────────────────────────────────────────────── */
  const spacingItems = [
    { token: '1', px: 4, usage: 'gap entre icono y etiqueta', current: 'mr-1, gap-1' },
    { token: '2', px: 8, usage: 'gap entre elementos inline', current: 'gap-2, mr-2' },
    { token: '3', px: 12, usage: 'padding interno pequeño', current: 'px-3, mb-3' },
    { token: '4', px: 16, usage: 'padding de tarjeta pequeña', current: 'p-4, gap-4' },
    { token: '6', px: 24, usage: 'padding de tarjeta estándar', current: 'p-6, gap-6, mb-6' },
    { token: '8', px: 32, usage: 'separación entre secciones', current: 'mb-8, gap-8, space-y-8' },
    {
      token: '12',
      px: 48,
      usage: 'separación entre bloques mayores',
      current: 'py-8 (inconsistente)'
    },
    {
      token: '16',
      px: 64,
      usage: 'padding de página / sección hero',
      current: 'no definido'
    }
  ]

  const spacingProblems = [
    {
      problem: 'mb-8 y space-y-8 mezclados',
      detail:
        'dashboard/index.vue usa mb-8 y space-y-8 al mismo nivel. space-y-* aplica margin-top a hijos, mb-* aplica margin-bottom al padre. El resultado es doble espaciado en algunos casos.'
    },
    {
      problem: 'Subtítulo de página demasiado grande',
      detail:
        'dashboard/index.vue usa size="lg" (18px) para el texto descriptivo bajo el h1. Un subtítulo de página debe ser sm (14px) o base (16px) a lo sumo: el propósito es orientar, no competir con el título. Con lg el bloque heading+sub pesa demasiado y empuja el contenido sin necesidad.'
    },
    {
      problem: 'p-6 en Card vs p-5 en ProfileHeader',
      detail:
        'Las tarjetas usan p-6 (24px) salvo ProfileHeader que usa pt-6 px-6 (manual). Sin un token de padding para cards la consistencia depende del desarrollador.'
    },
    {
      problem: 'No hay escala vertical entre title y subtitle',
      detail:
        'En el dashboard, el h1 tiene mb-3 antes del subtítulo pero mb-6 después del mismo. Debería ser siempre mb-1 entre heading y sub, y gestionar el espacio inferior con space-y-* en el padre, no con mb-* en el texto.'
    }
  ]

  /* ────────────────────────────────────────────────────────
   * Proposed changes (GO list)
   * ──────────────────────────────────────────────────────── */
  const proposedChanges = [
    {
      file: 'tailwind.config.ts',
      change:
        'fontFamily: { sans: ["Inter Variable", "Inter", ...] } + @fontsource-variable/inter (local)',
      impact: 'Toda la app usa Inter Variable sin depender de red'
    },
    {
      file: 'nuxt.config.ts',
      change:
        'Eliminar <link> Google Fonts Inter — reemplazado por @fontsource-variable/inter (local npm)',
      impact: 'La fuente se carga desde node_modules, sin red y sin bloqueo de render'
    },
    {
      file: 'Heading.vue — colorClasses',
      change:
        'primary: text-gray-900 → text-slate-900, secondary: text-gray-700 → text-slate-700, muted: text-gray-600 → text-slate-500 (dark: gray-400 → slate-400)',
      impact: 'Coherencia con el sistema de superficies slate-*'
    },
    {
      file: 'Text.vue — colorClasses',
      change:
        'Mismos cambios que Heading.vue + añadir white: "text-white" a colorClasses y al tipo TextColor',
      impact: 'Elimina inconsistencia de API con Heading'
    },
    {
      file: 'Heading.vue — computedClasses',
      change:
        'Aplicar leading-tight automáticamente cuando size es 2xl | 3xl | 4xl (a menos que leading esté explícito)',
      impact: 'Headings grandes se ven más compactos sin cambios en los call sites'
    },
    {
      file: 'Text.vue — defaults',
      change: 'Cambiar default de leading: "normal" a "relaxed" solo cuando as="p"',
      impact: 'Párrafos mejoran legibilidad sin afectar spans ni divs'
    },
    {
      file: 'dashboard/index.vue — Page Header',
      change:
        'Heading: size="3xl" weight="bold" → size="2xl" weight="extrabold", class="mb-3" → class="mb-1". Text: size="lg" class="mb-6" → size="sm" (sin mb en el texto, el espacio lo gestiona space-y-8 del padre). Eliminar div.mb-8 wrapper redudante.',
      impact: 'Título más robusto y compacto, subtítulo en su peso correcto, sin doble margen'
    },
    {
      file: 'ProfileHeader.vue — Heading',
      change:
        'Quitar text-gray-900 de class-name. Dejar solo class-name="truncate" y que color="primary" actúe con el token correcto.',
      impact:
        'Tras la migración a slate-* este heading dejará de ser el único elemento anclado en gray-900'
    }
  ]

  /* ────────────────────────────────────────────────────────
   * Misuse audit
   * ──────────────────────────────────────────────────────── */
  const misuses = [
    {
      severity: 'high',
      file: 'OnboardingWizard.vue',
      lines: '109–110',
      component: '<h1> y <p> raw',
      issue:
        'Tags HTML crudos bypassean el sistema de componentes. El p tiene w-[500px] fijo sin breakpoint — se rompe en móvil. gray-500 hardcoded ignorará la migración a slate-*.',
      current: '<h1 class="text-4xl font-bold">\n<p class="w-[500px] text-lg text-gray-500">',
      fix: '<Heading level="h1" size="3xl" weight="extrabold">\n<Text size="base" color="muted" class="max-w-lg">'
    },
    {
      severity: 'medium',
      file: 'ProfileHeader.vue',
      lines: '48',
      component: '<Heading class-name>',
      issue:
        'class-name="truncate text-gray-900" sobreescribe el color-token con un valor hardcoded. Cuando el sistema migre a slate-900 este heading permanecerá en gray-900.',
      current: 'class-name="truncate text-gray-900"',
      fix: 'class-name="truncate" (dejar que color="primary" aplique el token)'
    },
    {
      severity: 'medium',
      file: 'dashboard/index.vue',
      lines: '55–58',
      component: '<Heading> + <Text>',
      issue:
        'weight="bold" demasiado ligero para un page-title. size="lg" en el subtítulo compite visualmente con el título. mb-6 en el Text + mb-8 en el div wrapper + space-y-8 externo = triple margen inferior acumulado.',
      current: '<Heading size="3xl" weight="bold" class="mb-3">\n<Text size="lg" class="mb-6">',
      fix: '<Heading size="2xl" weight="extrabold" class="mb-1">\n<Text size="sm"> (sin mb)'
    },
    {
      severity: 'low',
      file: 'pages/index.vue',
      lines: '45–48',
      component: '<h2>, <p> raw',
      issue:
        'Raw HTML en la landing. El <p> puede migrar a <Text color="white"> (se propone añadir white a Text.vue). La <h2> es excusable solo si necesita drop-shadow-md, que no está en la API del componente.',
      current:
        '<h2 class="text-3xl font-extrabold text-white">\n<p class="text-base text-white/90">',
      fix: 'Mantener <h2> con drop-shadow. Migrar <p> a <Text size="base" color="white"> cuando se añada el token'
    }
  ]

  const teamRules = [
    'Nunca usar <h1>–<h6> ni <p> directamente en layouts/pages. Siempre <Heading> y <Text>.',
    'Nunca pasar text-gray-* o text-slate-* en class-name de <Heading>/<Text>. Usar el prop color para que el token haga su trabajo.',
    'El espaciado entre heading y subtítulo es siempre mt-1. El espacio entre bloques lo gestiona el padre con space-y-* o gap-*.',
    'El subtítulo de página es size="sm" color="muted". No "lg" — ese tamaño compite con el título.',
    'Anchos fijos como w-[500px] están prohibidos sin breakpoint. Usar max-w-* para que el contenido sea responsivo.'
  ]
</script>

<template>
  <div :class="[darkMode ? 'dark' : '']">
    <div
      class="min-h-screen bg-slate-100 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100"
    >
      <!-- Top bar -->
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold text-teal-600">FH</span>
          <h1 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Design Preview — Tipografía &amp; Espaciado
          </h1>
          <span
            class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          >
            PRE-GO · solo lectura
          </span>
        </div>
        <div class="flex items-center gap-3">
          <!-- Tab switcher -->
          <div
            class="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800"
          >
            <button
              v-for="tab in [
                { id: 'diagnosis', label: 'Diagnóstico' },
                { id: 'scale', label: 'Escala' },
                { id: 'spacing', label: 'Espaciado' },
                { id: 'audit', label: 'Auditoría' }
              ]"
              :key="tab.id"
              :class="[
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              ]"
              @click="activeTab = tab.id as typeof activeTab"
            >
              {{ tab.label }}
            </button>
          </div>
          <!-- Dark toggle -->
          <button
            :class="[
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              darkMode
                ? 'border-slate-600 bg-slate-700 text-white'
                : 'border-slate-200 bg-white text-slate-600'
            ]"
            @click="darkMode = !darkMode"
          >
            {{ darkMode ? '☀ Claro' : '☾ Oscuro' }}
          </button>
        </div>
      </div>

      <!-- ─────────────────────────────────────────────────────
           TAB: DIAGNÓSTICO
           ───────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'diagnosis'" class="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <!-- Summary -->
        <div
          class="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800/40 dark:bg-amber-950/30"
        >
          <h2 class="mb-2 text-base font-bold text-amber-800 dark:text-amber-400">
            Resumen del diagnóstico
          </h2>
          <p class="text-sm leading-relaxed text-amber-700 dark:text-amber-300">
            Se encontraron
            <strong>7 problemas</strong>
            distribuidos en los componentes de tipografía y los patrones de espaciado. Los de mayor
            impacto son la inconsistencia de tokens de color (
            <code class="rounded bg-amber-100 px-1 dark:bg-amber-900">gray-* vs slate-*</code>
            ), la ausencia de una fuente definida, y el line-height demasiado suelto en headings
            grandes.
          </p>
        </div>

        <!-- Issues list -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Problemas identificados</h2>
          <div
            v-for="(item, i) in issues"
            :key="i"
            class="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div class="mb-2 flex items-start justify-between gap-4">
              <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {{ item.file }}
                </span>
                <h3 class="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                  {{ item.issue }}
                </h3>
              </div>
              <span
                :class="[
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                  item.severity === 'high'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    : item.severity === 'medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                ]"
              >
                {{ severityLabel[item.severity] }}
              </span>
            </div>
            <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {{ item.detail }}
            </p>
          </div>
        </div>

        <!-- Proposed GO changes -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Cambios propuestos (GO)</h2>
          <div
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                >
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Archivo
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Cambio
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Impacto
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="(c, i) in proposedChanges"
                  :key="i"
                  class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td class="px-4 py-3">
                    <code
                      class="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {{ c.file }}
                    </code>
                  </td>
                  <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ c.change }}</td>
                  <td class="px-4 py-3 text-slate-500 dark:text-slate-400">{{ c.impact }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ─────────────────────────────────────────────────────
           TAB: ESCALA TIPOGRÁFICA
           ───────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'scale'" class="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <!-- Font family comparison -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Current: no font defined -->
          <div
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div class="mb-4 flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-red-400"></span>
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Actual · sin fuente definida
              </span>
            </div>
            <p
              style="font-family: Arial, Helvetica, sans-serif"
              class="mb-1 text-2xl font-bold text-slate-800 dark:text-slate-200"
            >
              Dashboard Financiero
            </p>
            <p
              style="font-family: Arial, Helvetica, sans-serif"
              class="mb-2 text-sm text-slate-500"
            >
              Ingreso total del mes: $5.000.000 COP
            </p>
            <p style="font-family: Arial, Helvetica, sans-serif" class="text-xs text-slate-400">
              Números: 0 1 2 3 4 5 6 7 8 9 — 1.234.567
            </p>
            <p class="mt-3 text-xs text-slate-400">
              Browser fallback: Arial (Windows) / Helvetica (macOS)
            </p>
          </div>

          <!-- Proposed: Inter -->
          <div
            class="rounded-xl border border-teal-200 bg-teal-50/40 p-6 shadow-sm dark:border-teal-800/50 dark:bg-teal-950/20"
          >
            <div class="mb-4 flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-teal-500"></span>
              <span
                class="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400"
              >
                Propuesto · Inter
              </span>
            </div>
            <p
              style="font-family: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
              class="mb-1 text-2xl font-bold text-slate-800 dark:text-slate-200"
            >
              Dashboard Financiero
            </p>
            <p
              style="font-family: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
              class="mb-2 text-sm text-slate-500"
            >
              Ingreso total del mes: $5.000.000 COP
            </p>
            <p
              style="font-family: 'Inter Variable', 'Inter', ui-sans-serif, system-ui, sans-serif"
              class="text-xs text-slate-400"
            >
              Números: 0 1 2 3 4 5 6 7 8 9 — 1.234.567
            </p>
            <p class="mt-3 text-xs text-teal-600 dark:text-teal-400">
              Mejor legibilidad numérica · cifras tabulares equilibradas
            </p>
          </div>
        </div>

        <!-- Type scale table + live preview -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Escala semántica: actual vs propuesto
          </h2>

          <div
            v-for="(row, i) in typeScale"
            :key="i"
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <!-- Role header -->
            <div
              class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-2 dark:border-slate-800 dark:bg-slate-800/60"
            >
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {{ row.role }}
              </span>
            </div>

            <div class="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
              <!-- Current -->
              <div class="p-5">
                <div class="mb-3 flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  <span class="text-xs text-slate-400">Actual</span>
                  <span class="ml-auto font-mono text-xs text-slate-400">
                    {{ row.current.size }} · {{ row.current.weight }} · {{ row.current.leading }}
                  </span>
                </div>
                <!-- Render with gray (current behavior) -->
                <div
                  :style="{ fontFamily: 'Arial, Helvetica, sans-serif' }"
                  :class="[
                    'text-gray-900',
                    row.current.size === '3xl'
                      ? 'text-3xl'
                      : row.current.size === 'xl'
                        ? 'text-xl'
                        : row.current.size === 'lg'
                          ? 'text-lg'
                          : row.current.size === 'base'
                            ? 'text-base'
                            : row.current.size === 'sm'
                              ? 'text-sm'
                              : 'text-xs',
                    row.current.weight === 'bold'
                      ? 'font-bold'
                      : row.current.weight === 'semibold'
                        ? 'font-semibold'
                        : 'font-normal',
                    'leading-normal',
                    row.role === 'Body Muted' ||
                    row.role === 'Caption / Small' ||
                    row.role === 'Overline / Label'
                      ? 'text-gray-600'
                      : 'text-gray-900'
                  ]"
                >
                  {{ row.example }}
                </div>
              </div>

              <!-- Proposed -->
              <div class="bg-teal-50/30 p-5 dark:bg-teal-950/10">
                <div class="mb-3 flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                  <span class="text-xs text-teal-600 dark:text-teal-400">Propuesto</span>
                  <span class="ml-auto font-mono text-xs text-teal-600 dark:text-teal-400">
                    {{ row.proposed.size }} · {{ row.proposed.weight }} · {{ row.proposed.leading }}
                  </span>
                </div>
                <!-- Render with Inter Variable + slate + correct line-height -->
                <div
                  :style="{
                    fontFamily:
                      '\'Inter Variable\', \'Inter\', ui-sans-serif, system-ui, sans-serif'
                  }"
                  :class="[
                    row.proposed.size === '3xl'
                      ? 'text-3xl'
                      : row.proposed.size === 'xl'
                        ? 'text-xl'
                        : row.proposed.size === 'lg'
                          ? 'text-lg'
                          : row.proposed.size === 'base'
                            ? 'text-base'
                            : row.proposed.size === 'sm'
                              ? 'text-sm'
                              : 'text-xs',
                    row.proposed.weight === 'bold'
                      ? 'font-bold'
                      : row.proposed.weight === 'semibold'
                        ? 'font-semibold'
                        : 'font-normal',
                    row.proposed.leading.startsWith('tight')
                      ? 'leading-tight'
                      : row.proposed.leading.startsWith('snug')
                        ? 'leading-snug'
                        : row.proposed.leading.startsWith('relaxed')
                          ? 'leading-relaxed'
                          : 'leading-normal',
                    row.role === 'Body Muted' ||
                    row.role === 'Caption / Small' ||
                    row.role === 'Overline / Label'
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-900 dark:text-white',
                    row.role === 'Overline / Label' ? 'uppercase tracking-wider' : ''
                  ]"
                >
                  {{ row.example }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Color token comparison -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Tokens de color de texto</h2>
          <div
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800"
                >
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Rol
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Actual (gray-*)
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Propuesto (slate-*)
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Muestra
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="row in [
                    {
                      role: 'primary',
                      cur: 'gray-900 / white',
                      pro: 'slate-900 / white',
                      curHex: '#111827',
                      proHex: '#0f172a'
                    },
                    {
                      role: 'secondary',
                      cur: 'gray-700 / gray-300',
                      pro: 'slate-700 / slate-300',
                      curHex: '#374151',
                      proHex: '#334155'
                    },
                    {
                      role: 'muted',
                      cur: 'gray-600 / gray-400',
                      pro: 'slate-500 / slate-400',
                      curHex: '#4b5563',
                      proHex: '#64748b'
                    }
                  ]"
                  :key="row.role"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td class="px-4 py-3">
                    <code class="rounded bg-slate-100 px-1.5 text-xs dark:bg-slate-800">
                      {{ row.role }}
                    </code>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ row.cur }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-teal-600 dark:text-teal-400">
                    {{ row.pro }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <span class="text-sm font-medium" :style="{ color: row.curHex }">
                        Texto actual
                      </span>
                      <span class="text-slate-400">→</span>
                      <span class="text-sm font-medium" :style="{ color: row.proHex }">
                        Texto propuesto
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-slate-400">
            Nota: en dark mode el cambio es mínimo (slate-400 vs gray-400 difieren en ≤2px de tono).
            El impacto real es en light mode donde slate aporta el tono azul-frío que ya tienen las
            superficies.
          </p>
        </div>
      </div>

      <!-- ─────────────────────────────────────────────────────
           TAB: ESPACIADO
           ───────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'spacing'" class="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <!-- Problems -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Problemas de espaciado detectados
          </h2>

          <div
            v-for="(p, i) in spacingProblems"
            :key="i"
            class="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/40 dark:bg-amber-950/20"
          >
            <h3 class="mb-1 text-sm font-semibold text-amber-800 dark:text-amber-400">
              {{ p.problem }}
            </h3>
            <p class="text-sm leading-relaxed text-amber-700 dark:text-amber-300">{{ p.detail }}</p>
          </div>
        </div>

        <!-- 8pt grid -->
        <div class="space-y-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">
              Grilla de 8pt (Tailwind spacing)
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              Cada token representa un múltiplo de 4px. Los usados frecuentemente deberían tener un
              rol documentado.
            </p>
          </div>

          <div
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <table class="w-full text-sm">
              <thead>
                <tr
                  class="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800"
                >
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Token
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    px
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Rol propuesto
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Uso actual
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Visual
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="s in spacingItems"
                  :key="s.token"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td class="px-4 py-3">
                    <code class="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
                      {{ s.token }}
                    </code>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ s.px }}px</td>
                  <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ s.usage }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-400">{{ s.current }}</td>
                  <td class="px-4 py-3">
                    <div
                      class="h-3 rounded-sm bg-teal-400/60"
                      :style="{ width: `${s.px}px`, minWidth: '4px' }"
                    ></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Before/After spacing in a card -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Ritmo vertical — antes / después
          </h2>

          <div class="grid grid-cols-2 gap-6">
            <!-- Actual: mixed spacing -->
            <div>
              <div class="mb-2 flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-red-400"></span>
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actual — espaciado irregular
                </span>
              </div>
              <div
                class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                :style="{ fontFamily: 'Arial, Helvetica, sans-serif' }"
              >
                <div class="p-6">
                  <!-- mb-8 en page header -->
                  <div class="mb-8">
                    <h1
                      class="mb-3 text-3xl font-bold leading-normal text-gray-900 dark:text-white"
                    >
                      Dashboard Financiero
                    </h1>
                    <p class="mb-6 text-lg leading-normal text-gray-500">
                      Conoce el estado de tus finanzas y toma decisiones inteligentes.
                    </p>
                  </div>
                  <!-- space-y-6 en cards -->
                  <div class="space-y-6">
                    <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <h3
                        class="mb-2 text-lg font-semibold leading-normal text-gray-900 dark:text-white"
                      >
                        Estado del Presupuesto
                      </h3>
                      <p class="text-sm leading-normal text-gray-600 dark:text-gray-400">
                        64% utilizado este mes
                      </p>
                    </div>
                    <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <h3
                        class="mb-2 text-lg font-semibold leading-normal text-gray-900 dark:text-white"
                      >
                        Últimas Transacciones
                      </h3>
                      <p class="text-sm leading-normal text-gray-600 dark:text-gray-400">
                        3 movimientos hoy
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  class="mt-2 border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                >
                  mb-8 en header + mb-3/mb-6 en textos → doble margen inferior antes de las cards
                </div>
              </div>
            </div>

            <!-- Propuesto: consistent spacing -->
            <div>
              <div class="mb-2 flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-teal-500"></span>
                <span
                  class="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400"
                >
                  Propuesto — ritmo consistente
                </span>
              </div>
              <div
                class="rounded-xl border border-teal-200 bg-white shadow-sm dark:border-teal-800/50 dark:bg-slate-900"
                :style="{
                  fontFamily: '\'Inter Variable\', \'Inter\', ui-sans-serif, system-ui, sans-serif'
                }"
              >
                <div class="p-6">
                  <!-- space-y-8 único en la página -->
                  <div class="space-y-8">
                    <div>
                      <h1
                        class="text-2xl font-extrabold leading-tight text-slate-900 dark:text-white"
                      >
                        Dashboard Financiero
                      </h1>
                      <p class="mt-1 text-sm leading-snug text-slate-500">
                        Conoce el estado de tus finanzas y toma decisiones inteligentes.
                      </p>
                    </div>
                    <!-- space-y-4 en cards -->
                    <div class="space-y-4">
                      <div class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <h3
                          class="text-lg font-semibold leading-snug text-slate-900 dark:text-white"
                        >
                          Estado del Presupuesto
                        </h3>
                        <p class="mt-1 text-sm leading-snug text-slate-500">
                          64% utilizado este mes
                        </p>
                      </div>
                      <div class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <h3
                          class="text-lg font-semibold leading-snug text-slate-900 dark:text-white"
                        >
                          Últimas Transacciones
                        </h3>
                        <p class="mt-1 text-sm leading-snug text-slate-500">3 movimientos hoy</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="mt-2 border-t border-teal-100 bg-teal-50 px-4 py-2 text-xs text-teal-700 dark:border-teal-900/40 dark:bg-teal-950/20 dark:text-teal-400"
                >
                  space-y-8 único · Heading 2xl/extrabold · Text sm/mt-1 · space-y-4 entre cards
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Heading leading comparison -->
        <div class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Line-height en headings largos
          </h2>
          <p class="text-sm text-slate-500">
            La diferencia se aprecia en títulos de 2+ palabras. Con leading-tight los bloques de
            texto son más compactos y jerárquicos.
          </p>

          <div class="grid grid-cols-2 gap-6">
            <div
              class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Actual · leading-normal (1.5)
              </p>
              <h1
                class="text-3xl font-bold leading-normal text-gray-900 dark:text-white"
                :style="{ fontFamily: 'Arial, Helvetica, sans-serif' }"
              >
                Configura tu Perfil Financiero
              </h1>
              <div class="mt-2 h-px bg-slate-100 dark:bg-slate-800"></div>
              <h2
                class="mt-3 text-xl font-semibold leading-normal text-gray-900 dark:text-white"
                :style="{ fontFamily: 'Arial, Helvetica, sans-serif' }"
              >
                Estado del Presupuesto Mensual
              </h2>
            </div>

            <div
              class="rounded-xl border border-teal-200 bg-teal-50/30 p-6 shadow-sm dark:border-teal-800/50 dark:bg-teal-950/10"
            >
              <p
                class="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400"
              >
                Propuesto · 2xl/extrabold/leading-tight · xl–lg/semibold/leading-snug
              </p>
              <h1
                class="text-2xl font-extrabold leading-tight text-slate-900 dark:text-white"
                :style="{
                  fontFamily: '\'Inter Variable\', \'Inter\', ui-sans-serif, system-ui, sans-serif'
                }"
              >
                Configura tu Perfil Financiero
              </h1>
              <div class="mt-2 h-px bg-teal-100 dark:bg-teal-900/40"></div>
              <h2
                class="mt-3 text-xl font-semibold leading-snug text-slate-900 dark:text-white"
                :style="{
                  fontFamily: '\'Inter Variable\', \'Inter\', ui-sans-serif, system-ui, sans-serif'
                }"
              >
                Estado del Presupuesto Mensual
              </h2>
            </div>
          </div>
        </div>
      </div>

      <!-- ─────────────────────────────────────────────────────
           TAB: AUDITORÍA DE USO
           ───────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'audit'" class="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <!-- Summary -->
        <div
          class="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800/40 dark:bg-red-950/20"
        >
          <h2 class="mb-2 text-base font-bold text-red-800 dark:text-red-400">
            Uso incorrecto de componentes tipográficos
          </h2>
          <p class="text-sm leading-relaxed text-red-700 dark:text-red-300">
            Se encontraron
            <strong>4 archivos</strong>
            con uso incorrecto o subóptimo de los componentes de tipografía. Los más críticos son
            los tags HTML crudos que bypassean el sistema y el override de color-token en
            ProfileHeader.
          </p>
        </div>

        <!-- Misuses list -->
        <div class="space-y-5">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Hallazgos por archivo</h2>

          <div
            v-for="(m, i) in misuses"
            :key="i"
            class="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <!-- Card header -->
            <div
              class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/60"
            >
              <div class="flex items-center gap-3">
                <code
                  class="rounded bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-200"
                >
                  {{ m.file }}:{{ m.lines }}
                </code>
                <span class="text-xs text-slate-500">{{ m.component }}</span>
              </div>
              <span
                :class="[
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                  m.severity === 'high'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    : m.severity === 'medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                ]"
              >
                {{ severityLabel[m.severity] }}
              </span>
            </div>

            <div class="p-5">
              <!-- Issue description -->
              <p class="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {{ m.issue }}
              </p>

              <!-- Before/After code -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p
                    class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-500 dark:text-red-400"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                    Actual
                  </p>
                  <pre
                    class="overflow-x-auto rounded-lg bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700 dark:bg-red-950/30 dark:text-red-300"
                    >{{ m.current }}</pre
                  >
                </div>
                <div>
                  <p
                    class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    Fix
                  </p>
                  <pre
                    class="overflow-x-auto rounded-lg bg-teal-50 px-4 py-3 text-xs leading-relaxed text-teal-700 dark:bg-teal-950/30 dark:text-teal-300"
                    >{{ m.fix }}</pre
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick wins that DON'T need GO -->
        <div
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 class="mb-4 text-base font-bold text-slate-900 dark:text-white">
            Reglas de oro para el equipo
          </h2>
          <ul class="space-y-3">
            <li
              v-for="rule in teamRules"
              :key="rule"
              class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <span
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
              >
                ✓
              </span>
              {{ rule }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
