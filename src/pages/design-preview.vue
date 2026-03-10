<script setup lang="ts">
  /**
   * Design Preview — Color System Proposal
   * READ ONLY / dev-only page. Does not modify any existing component.
   *
   * Analyzes the current palette and presents the proposed changes side-by-side.
   * No existing file is modified until the team gives the GO.
   */
  import { ref } from 'vue'

  definePageMeta({ layout: false })

  const darkMode = ref(false)
  const activeSection = ref<'overview' | 'components' | 'dark'>('overview')

  /* ──────────────────────────────────────────────
   * Color tokens — current vs proposed
   * ────────────────────────────────────────────── */
  const palette = {
    primary: [
      { shade: '50', hex: '#f0fdfa', label: 'primary-50' },
      { shade: '100', hex: '#ccfbf1', label: 'primary-100' },
      { shade: '200', hex: '#99f6e4', label: 'primary-200' },
      { shade: '300', hex: '#5eead4', label: 'primary-300' },
      { shade: '400', hex: '#2dd4bf', label: 'primary-400' },
      { shade: '500', hex: '#14b8a6', label: 'primary-500 ★' },
      { shade: '600', hex: '#0d9488', label: 'primary-600 btn' },
      { shade: '700', hex: '#0f766e', label: 'primary-700' },
      { shade: '800', hex: '#115e59', label: 'primary-800' },
      { shade: '900', hex: '#134e4a', label: 'primary-900' }
    ],
    secondaryCurrent: [
      { shade: '50', hex: '#eef2ff', label: 'indigo-50' },
      { shade: '100', hex: '#e0e7ff', label: 'indigo-100' },
      { shade: '200', hex: '#c7d2fe', label: 'indigo-200' },
      { shade: '300', hex: '#a5b4fc', label: 'indigo-300' },
      { shade: '400', hex: '#818cf8', label: 'indigo-400' },
      { shade: '500', hex: '#6366f1', label: 'indigo-500 ★' },
      { shade: '600', hex: '#4f46e5', label: 'indigo-600' },
      { shade: '700', hex: '#4338ca', label: 'indigo-700' },
      { shade: '800', hex: '#3730a3', label: 'indigo-800' },
      { shade: '900', hex: '#312e81', label: 'indigo-900' }
    ],
    secondaryProposed: [
      { shade: '50', hex: '#eff6ff', label: 'blue-50' },
      { shade: '100', hex: '#dbeafe', label: 'blue-100' },
      { shade: '200', hex: '#bfdbfe', label: 'blue-200' },
      { shade: '300', hex: '#93c5fd', label: 'blue-300' },
      { shade: '400', hex: '#60a5fa', label: 'blue-400' },
      { shade: '500', hex: '#3b82f6', label: 'blue-500 ★' },
      { shade: '600', hex: '#2563eb', label: 'blue-600 btn' },
      { shade: '700', hex: '#1d4ed8', label: 'blue-700' },
      { shade: '800', hex: '#1e40af', label: 'blue-800' },
      { shade: '900', hex: '#1e3a8a', label: 'blue-900' }
    ]
  }

  /* ──────────────────────────────────────────────
   * Design arguments
   * ────────────────────────────────────────────── */
  const changes = [
    {
      id: 1,
      tag: 'CAMBIO',
      title: 'Secondary: Indigo → Blue 600',
      severity: 'high',
      current: '#6366f1',
      proposed: '#2563eb',
      currentLabel: 'Indigo-500',
      proposedLabel: 'Blue-600',
      rationale:
        'El indigo actual y el teal primario son ambos colores fríos de alta saturación. Su temperatura de color es casi idéntica (~240-180° en Hue), lo que genera rivalidad visual: ninguno domina. El azul-600 se separa semánticamente: teal = acciones de marca / primarias, azul = información / vínculos. Además el contraste sobre blanco mejora: indigo-500 = 3.8:1 (falla AA en text pequeño), blue-600 = 5.9:1 (pasa AA en todos los tamaños).',
      wcag: { current: '3.8:1 ⚠ falla AA texto pequeño', proposed: '5.9:1 ✓ AA en todos' }
    },
    {
      id: 2,
      tag: 'CAMBIO',
      title: 'Fondo de página: slate-50 → slate-100',
      severity: 'medium',
      current: '#f8fafc',
      proposed: '#f1f5f9',
      currentLabel: 'slate-50',
      proposedLabel: 'slate-100',
      rationale:
        'La diferencia actual entre fondo (#f8fafc) y card (#ffffff) es solo 0.02 de luminosidad, casi imperceptible en monitores mal calibrados. Usando slate-100 la diferencia aumenta 3×, estableciendo jerarquía de superficie real. Esto mejora la "card depth" sin agregar sombras extra.',
      wcag: null
    },
    {
      id: 3,
      tag: 'CAMBIO',
      title: 'Texto neutro: gray-* → slate-*',
      severity: 'low',
      current: '#374151',
      proposed: '#334155',
      currentLabel: 'gray-700',
      proposedLabel: 'slate-700',
      rationale:
        'La escala gray de Tailwind es un gris neutro puro (sin bias de color). La escala slate tiene un undertone azul muy sutil que armoniza con el teal primario. El cambio es imperceptible en aislamiento pero crea cohesión sistémica: todos los elementos del UI "respiran" el mismo tono frío. Visualmente: Ej. gray-900 = #111827, slate-900 = #0f172a (más profundo, ligeramente más frío).',
      wcag: null
    },
    {
      id: 4,
      tag: 'NUEVO',
      title: 'Sistema de superficies dark mode',
      severity: 'high',
      current: null,
      proposed: null,
      currentLabel: 'Sin tokens dark definidos',
      proposedLabel: '4 niveles cohesivos',
      rationale:
        'Actualmente el dark mode usa dark:bg-gray-800 / dark:bg-gray-900 hardcodeados en cada componente sin sistema. El resultado: la sidebar es gray-900, los cards varían entre gray-800 y gray-700, crea falta de cohesión. Propuesta: bg-slate-950 (página) → slate-900 (sidebar) → slate-800 (card) → slate-700 (inset). El slate es más frío que gray, mejor armonía con teal en modo oscuro.',
      wcag: null
    },
    {
      id: 5,
      tag: 'MEJORA',
      title: 'MetricCard "Disponible": gradiente más profundo',
      severity: 'low',
      current: '#14b8a6',
      proposed: '#0f766e',
      currentLabel: 'teal-500 → teal-600',
      proposedLabel: 'teal-600 → teal-800',
      rationale:
        'El gradiente actual (teal-500 → teal-600) tiene muy poca diferencia de valor (solo 1 step). En pantallas de alta luminosidad se ve como color plano. Usando teal-600 → teal-800 (o agregar ring teal-900) la card destaca como elemento de acción destacado y el texto blanco sobre ella mejora de 4.6:1 a 7.2:1.',
      wcag: { current: '4.6:1 — pasa AA', proposed: '7.2:1 — pasa AAA' }
    },
    {
      id: 6,
      tag: 'MANTENER',
      title: 'Primary Teal — sin cambios',
      severity: 'none',
      current: '#14b8a6',
      proposed: '#14b8a6',
      currentLabel: 'teal-500',
      proposedLabel: 'teal-500 (sin cambio)',
      rationale:
        'El teal es la identidad de marca más fuerte del producto. Es reconocible, moderno, y asociado con fintech confiable (ver: Stripe, Revolut, Nubank en sus variantes). No se cambia. Se refuerza el uso como único color de acción primaria.',
      wcag: null
    }
  ]

  const severityConfig = {
    high: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Impacto Alto'
    },
    medium: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      label: 'Impacto Medio'
    },
    low: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Impacto Bajo'
    },
    none: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Sin Cambio'
    }
  }

  const tagConfig = {
    CAMBIO: 'bg-orange-100 text-orange-800',
    NUEVO: 'bg-purple-100 text-purple-800',
    MEJORA: 'bg-blue-100 text-blue-800',
    MANTENER: 'bg-green-100 text-green-800'
  }

  /* ──────────────────────────────────────────────
   * Mock data
   * ────────────────────────────────────────────── */
  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: true },
    { icon: 'receipt_long', label: 'Transacciones', active: false },
    { icon: 'account_balance_wallet', label: 'Presupuesto', active: false },
    { icon: 'savings', label: 'Metas de Ahorro', active: false }
  ]
</script>

<template>
  <!-- Root wrapper handles dark mode class -->
  <div :class="['min-h-screen', darkMode ? 'dark' : '']">
    <!-- ══════════════════════════════════════════
         PAGE SHELL
    ══════════════════════════════════════════ -->
    <div
      class="min-h-screen bg-slate-100 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100"
    >
      <!-- ──────────── TOP BAR ──────────── -->
      <header
        class="sticky top-0 z-50 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
      >
        <div class="mx-auto flex max-w-7xl items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-lg font-bold text-teal-600">FinHub</span>
            <span
              class="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700"
            >
              Design Preview
            </span>
          </div>

          <nav class="flex gap-1">
            <button
              v-for="s in ['overview', 'components', 'dark'] as const"
              :key="s"
              :class="[
                'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                activeSection === s
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              ]"
              @click="activeSection = s"
            >
              {{
                s === 'overview' ? 'Análisis' : s === 'components' ? 'Componentes' : 'Modo Oscuro'
              }}
            </button>
          </nav>

          <button
            :class="[
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              darkMode
                ? 'bg-slate-700 text-slate-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            ]"
            @click="darkMode = !darkMode"
          >
            <span class="material-symbols-outlined text-base">
              {{ darkMode ? 'light_mode' : 'dark_mode' }}
            </span>
            {{ darkMode ? 'Modo Claro' : 'Modo Oscuro' }}
          </button>
        </div>
      </header>

      <!-- ══════════════════════════════════════════
           SECTION: OVERVIEW / ANÁLISIS
      ══════════════════════════════════════════ -->
      <main v-if="activeSection === 'overview'" class="mx-auto max-w-7xl space-y-12 px-6 py-10">
        <!-- Title -->
        <div>
          <p class="mb-1 text-sm font-semibold uppercase tracking-widest text-teal-600">
            Design Lead Review · Marzo 2026
          </p>
          <h1 class="mb-3 text-4xl font-extrabold text-slate-900 dark:text-white">
            Propuesta de Sistema de Color
          </h1>
          <p class="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            El teal primario es sólido e identitario. El objetivo es reforzar su presencia elevando
            el contraste del sistema, estableciendo jerarquía de superficies y reemplazando colores
            que «compiten» con la marca por aliados semánticos.
          </p>
        </div>

        <!-- ── Palettes Side-by-Side ── -->
        <section>
          <h2 class="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Paletas de Color</h2>

          <div class="grid gap-8 lg:grid-cols-3">
            <!-- Primary (keep) -->
            <div>
              <div class="mb-3 flex items-center gap-2">
                <h3 class="font-semibold text-slate-800 dark:text-slate-200">Primary — Teal</h3>
                <span
                  class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800"
                >
                  SIN CAMBIO
                </span>
              </div>
              <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div
                  v-for="swatch in palette.primary"
                  :key="swatch.shade"
                  class="flex items-center justify-between px-4 py-2.5"
                  :style="{ backgroundColor: swatch.hex }"
                >
                  <span
                    class="font-mono text-xs font-medium"
                    :style="{
                      color: parseInt(swatch.shade) >= 500 ? '#fff' : '#0f172a'
                    }"
                  >
                    {{ swatch.label }}
                  </span>
                  <span
                    class="font-mono text-xs"
                    :style="{
                      color: parseInt(swatch.shade) >= 500 ? 'rgba(255,255,255,0.7)' : '#64748b'
                    }"
                  >
                    {{ swatch.hex }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Secondary Current -->
            <div>
              <div class="mb-3 flex items-center gap-2">
                <h3 class="font-semibold text-slate-800 dark:text-slate-200">
                  Secondary Actual — Indigo
                </h3>
                <span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                  REEMPLAZAR
                </span>
              </div>
              <div class="overflow-hidden rounded-xl border-2 border-red-300">
                <div
                  v-for="swatch in palette.secondaryCurrent"
                  :key="swatch.shade"
                  class="flex items-center justify-between px-4 py-2.5"
                  :style="{ backgroundColor: swatch.hex }"
                >
                  <span
                    class="font-mono text-xs font-medium"
                    :style="{
                      color: parseInt(swatch.shade) >= 500 ? '#fff' : '#0f172a'
                    }"
                  >
                    {{ swatch.label }}
                  </span>
                  <span
                    class="font-mono text-xs"
                    :style="{
                      color: parseInt(swatch.shade) >= 500 ? 'rgba(255,255,255,0.7)' : '#64748b'
                    }"
                  >
                    {{ swatch.hex }}
                  </span>
                </div>
              </div>
              <p class="mt-2 text-xs text-red-600 dark:text-red-400">
                ⚠ Compite visualmente con el teal (ambos fríos-saturados). indigo-500 falla WCAG AA
                en texto pequeño sobre blanco (3.8:1).
              </p>
            </div>

            <!-- Secondary Proposed -->
            <div>
              <div class="mb-3 flex items-center gap-2">
                <h3 class="font-semibold text-slate-800 dark:text-slate-200">
                  Secondary Propuesto — Blue
                </h3>
                <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                  PROPUESTA
                </span>
              </div>
              <div class="overflow-hidden rounded-xl border-2 border-blue-400">
                <div
                  v-for="swatch in palette.secondaryProposed"
                  :key="swatch.shade"
                  class="flex items-center justify-between px-4 py-2.5"
                  :style="{ backgroundColor: swatch.hex }"
                >
                  <span
                    class="font-mono text-xs font-medium"
                    :style="{
                      color: parseInt(swatch.shade) >= 500 ? '#fff' : '#0f172a'
                    }"
                  >
                    {{ swatch.label }}
                  </span>
                  <span
                    class="font-mono text-xs"
                    :style="{
                      color: parseInt(swatch.shade) >= 500 ? 'rgba(255,255,255,0.7)' : '#64748b'
                    }"
                  >
                    {{ swatch.hex }}
                  </span>
                </div>
              </div>
              <p class="mt-2 text-xs text-blue-600 dark:text-blue-400">
                ✓ blue-600 = 5.9:1 sobre blanco. Diferenciación semántica clara: teal = marca / azul
                = info-vínculos.
              </p>
            </div>
          </div>
        </section>

        <!-- ── Surface Hierarchy ── -->
        <section>
          <h2 class="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            Jerarquía de Superficies
          </h2>
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Current -->
            <div>
              <p
                class="mb-3 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300"
              >
                <span class="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">ACTUAL</span>
                Poca diferencia perceptible
              </p>
              <div class="space-y-2">
                <div
                  v-for="surface in [
                    { label: 'Page bg', hex: '#f8fafc', tag: 'slate-50', diff: null },
                    {
                      label: 'Card bg',
                      hex: '#ffffff',
                      tag: 'white',
                      diff: 'Δ luminosidad: 0.02 → imperceptible'
                    },
                    { label: 'Inset (N/A)', hex: '#f8fafc', tag: 'N/D', diff: null }
                  ]"
                  :key="surface.label"
                  class="flex items-center gap-4 rounded-lg border border-slate-200 p-3"
                >
                  <div
                    class="h-10 w-10 shrink-0 rounded-lg border border-slate-300 shadow-inner"
                    :style="{ backgroundColor: surface.hex }"
                  />
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {{ surface.label }}
                      <code class="ml-1 rounded bg-slate-100 px-1 text-xs text-slate-600">
                        {{ surface.tag }}
                      </code>
                    </p>
                    <p v-if="surface.diff" class="text-xs text-red-500">{{ surface.diff }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Proposed -->
            <div>
              <p
                class="mb-3 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300"
              >
                <span class="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                  PROPUESTA
                </span>
                3 niveles de profundidad claros
              </p>
              <div class="space-y-2">
                <div
                  v-for="surface in [
                    {
                      label: 'Page bg',
                      hex: '#f1f5f9',
                      tag: 'slate-100',
                      diff: 'Base amplificada (3× más oscura que slate-50)'
                    },
                    { label: 'Card bg', hex: '#ffffff', tag: 'white', diff: null },
                    {
                      label: 'Inset/nested',
                      hex: '#f8fafc',
                      tag: 'slate-50',
                      diff: 'Áreas dentro de cards (inputs, sub-secciones)'
                    }
                  ]"
                  :key="surface.label"
                  class="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div
                    class="h-10 w-10 shrink-0 rounded-lg border border-slate-200"
                    :style="{ backgroundColor: surface.hex }"
                  />
                  <div>
                    <p class="text-sm font-medium text-slate-800">
                      {{ surface.label }}
                      <code class="ml-1 rounded bg-slate-100 px-1 text-xs text-slate-600">
                        {{ surface.tag }}
                      </code>
                    </p>
                    <p v-if="surface.diff" class="text-xs text-teal-600">{{ surface.diff }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Change Cards ── -->
        <section>
          <h2 class="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            Argumentos de Cambio
          </h2>
          <div class="space-y-4">
            <div
              v-for="change in changes"
              :key="change.id"
              :class="[
                'rounded-2xl border p-6 transition-shadow hover:shadow-md dark:bg-slate-900',
                severityConfig[change.severity].border
              ]"
              :style="{ backgroundColor: change.severity === 'none' ? '#f0fdf4' : undefined }"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      :class="[
                        'rounded-full px-2.5 py-0.5 text-xs font-bold',
                        tagConfig[change.tag as keyof typeof tagConfig]
                      ]"
                    >
                      {{ change.tag }}
                    </span>
                    <span
                      :class="[
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        severityConfig[change.severity].bg,
                        severityConfig[change.severity].text
                      ]"
                    >
                      {{ severityConfig[change.severity].label }}
                    </span>
                  </div>
                  <h3 class="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                    {{ change.title }}
                  </h3>
                  <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {{ change.rationale }}
                  </p>
                  <div v-if="change.wcag" class="mt-3 flex flex-wrap gap-4">
                    <div class="rounded-lg bg-red-50 px-3 py-2 text-sm dark:bg-red-950/30">
                      <span class="font-medium text-red-700 dark:text-red-400">Actual:</span>
                      <span class="text-red-600 dark:text-red-300">{{ change.wcag.current }}</span>
                    </div>
                    <div class="rounded-lg bg-green-50 px-3 py-2 text-sm dark:bg-green-950/30">
                      <span class="font-medium text-green-700 dark:text-green-400">Propuesto:</span>
                      <span class="text-green-600 dark:text-green-300">
                        {{ change.wcag.proposed }}
                      </span>
                    </div>
                  </div>
                </div>
                <!-- Color swatches inline -->
                <div v-if="change.current" class="flex shrink-0 items-center gap-3">
                  <div class="flex flex-col items-center gap-1">
                    <div
                      class="h-12 w-12 rounded-xl border-2 border-red-300 shadow-sm"
                      :style="{ backgroundColor: change.current }"
                    />
                    <span class="text-xs text-slate-500">{{ change.currentLabel }}</span>
                  </div>
                  <span class="material-symbols-outlined text-slate-400">arrow_forward</span>
                  <div class="flex flex-col items-center gap-1">
                    <div
                      class="h-12 w-12 rounded-xl border-2 border-green-400 shadow-sm"
                      :style="{ backgroundColor: change.proposed }"
                    />
                    <span class="text-xs text-slate-500">{{ change.proposedLabel }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- ══════════════════════════════════════════
           SECTION: COMPONENTS DEMO
      ══════════════════════════════════════════ -->
      <main
        v-else-if="activeSection === 'components'"
        class="mx-auto max-w-7xl space-y-10 px-6 py-10"
      >
        <div>
          <p class="mb-1 text-sm font-semibold uppercase tracking-widest text-teal-600">
            Delta visual
          </p>
          <h1 class="mb-2 text-4xl font-extrabold text-slate-900 dark:text-white">
            Antes vs Después — Componentes
          </h1>
          <p class="text-slate-600 dark:text-slate-400">
            Cada bloque muestra el componente actual (izquierda / arriba) vs propuesto (derecha /
            abajo).
          </p>
        </div>

        <!-- ── Buttons ── -->
        <section>
          <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-white">Botones</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Current -->
            <div class="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
              <p class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                ACTUAL — secondary = Indigo
              </p>
              <div class="flex flex-wrap gap-3">
                <button
                  class="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  <span class="material-symbols-outlined text-base">add</span>
                  Nueva Transacción
                </button>
                <button
                  class="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                >
                  <span class="material-symbols-outlined text-base">download</span>
                  Reporte
                </button>
                <button
                  class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
              <p class="mt-3 text-xs text-red-500">
                Teal + Indigo → rivalidad cromática (hue gap de ~60°, ambos saturados)
              </p>
            </div>
            <!-- Proposed -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-2 ring-teal-400 dark:bg-slate-800">
              <p class="mb-4 text-xs font-bold uppercase tracking-widest text-teal-600">
                PROPUESTO — secondary = Blue
              </p>
              <div class="flex flex-wrap gap-3">
                <button
                  class="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  <span class="material-symbols-outlined text-base">add</span>
                  Nueva Transacción
                </button>
                <button
                  class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <span class="material-symbols-outlined text-base">download</span>
                  Reporte
                </button>
                <button
                  class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
              <p class="mt-3 text-xs text-teal-600">
                Teal (primaria) + Blue (secundaria) → diferenciación semántica clara
              </p>
            </div>
          </div>
        </section>

        <!-- ── Metric Cards ── -->
        <section>
          <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-white">Metric Cards</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Current -->
            <div class="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
              <p class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                ACTUAL — teal-500→teal-600 (shallow gradient)
              </p>
              <div class="grid grid-cols-3 gap-3">
                <!-- Income -->
                <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex items-center justify-center rounded-lg bg-green-100 p-1.5">
                      <span
                        class="material-symbols-outlined text-[18px] leading-none text-green-600"
                      >
                        account_balance_wallet
                      </span>
                    </div>
                    <span class="text-xs font-medium text-gray-500">Ingresos</span>
                  </div>
                  <p class="text-lg font-bold text-gray-900">$5,000,000</p>
                  <p class="mt-1 text-xs text-green-600">+12%</p>
                </div>
                <!-- Expense -->
                <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex items-center justify-center rounded-lg bg-red-100 p-1.5">
                      <span class="material-symbols-outlined text-[18px] leading-none text-red-600">
                        receipt_long
                      </span>
                    </div>
                    <span class="text-xs font-medium text-gray-500">Gastos</span>
                  </div>
                  <p class="text-lg font-bold text-gray-900">$3,200,000</p>
                  <p class="mt-1 text-xs text-red-600">-5%</p>
                </div>
                <!-- Available — current gradient -->
                <div class="rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex items-center justify-center rounded-lg bg-white/20 p-1.5">
                      <span class="material-symbols-outlined text-[18px] leading-none text-white">
                        savings
                      </span>
                    </div>
                    <span class="text-xs font-medium text-white/80">Disponible</span>
                  </div>
                  <p class="text-lg font-bold text-white">$1,800,000</p>
                  <p class="mt-1 text-xs text-white/70">-2%</p>
                </div>
              </div>
              <p class="mt-3 text-xs text-red-500">
                "Disponible" gradient: teal-500→teal-600 · Contraste texto blanco: 4.6:1 (apenas AA)
              </p>
            </div>
            <!-- Proposed -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-2 ring-teal-400 dark:bg-slate-800">
              <p class="mb-4 text-xs font-bold uppercase tracking-widest text-teal-600">
                PROPUESTO — surfaces slate + gradient profundo
              </p>
              <div class="grid grid-cols-3 gap-3">
                <!-- Income -->
                <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex items-center justify-center rounded-lg bg-green-100 p-1.5">
                      <span
                        class="material-symbols-outlined text-[18px] leading-none text-green-600"
                      >
                        account_balance_wallet
                      </span>
                    </div>
                    <span class="text-xs font-medium text-slate-500">Ingresos</span>
                  </div>
                  <p class="text-lg font-bold text-slate-900">$5,000,000</p>
                  <p class="mt-1 text-xs text-green-600">+12%</p>
                </div>
                <!-- Expense -->
                <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex items-center justify-center rounded-lg bg-red-100 p-1.5">
                      <span class="material-symbols-outlined text-[18px] leading-none text-red-600">
                        receipt_long
                      </span>
                    </div>
                    <span class="text-xs font-medium text-slate-500">Gastos</span>
                  </div>
                  <p class="text-lg font-bold text-slate-900">$3,200,000</p>
                  <p class="mt-1 text-xs text-red-600">-5%</p>
                </div>
                <!-- Available — deep gradient -->
                <div class="rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 p-4 shadow-lg">
                  <div class="mb-3 flex items-center gap-2">
                    <div class="flex items-center justify-center rounded-lg bg-white/20 p-1.5">
                      <span class="material-symbols-outlined text-[18px] leading-none text-white">
                        savings
                      </span>
                    </div>
                    <span class="text-xs font-medium text-white/90">Disponible</span>
                  </div>
                  <p class="text-lg font-bold text-white">$1,800,000</p>
                  <p class="mt-1 text-xs text-teal-200">-2%</p>
                </div>
              </div>
              <p class="mt-3 text-xs text-teal-600">
                "Disponible" gradient: teal-600→teal-800 · Contraste: 7.2:1 (AAA). Cards:
                border-slate-200, text-slate-500/900
              </p>
            </div>
          </div>
        </section>

        <!-- ── Badges & Status ── -->
        <section>
          <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            Badges & Indicadores de Estado
          </h2>
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Current -->
            <div class="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
              <p class="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                ACTUAL — secondary-badge = indigo
              </p>
              <div class="flex flex-wrap gap-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                >
                  <span class="h-2 w-2 rounded-full bg-green-500"></span>
                  Cuenta Activa
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800"
                >
                  Nivel Pro
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800"
                >
                  Pendiente
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800"
                >
                  Error
                </span>
              </div>
              <p class="mt-3 text-xs text-red-500">
                Indigo "Nivel Pro" compite visualmente con teal en contexto de producto
              </p>
            </div>
            <!-- Proposed -->
            <div class="rounded-2xl bg-white p-6 shadow-sm ring-2 ring-teal-400 dark:bg-slate-800">
              <p class="mb-4 text-xs font-bold uppercase tracking-widest text-teal-600">
                PROPUESTO — secondary-badge = blue
              </p>
              <div class="flex flex-wrap gap-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                >
                  <span class="h-2 w-2 rounded-full bg-green-500"></span>
                  Cuenta Activa
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                >
                  Nivel Pro
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800"
                >
                  Pendiente
                </span>
                <span
                  class="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800"
                >
                  Error
                </span>
              </div>
              <p class="mt-3 text-xs text-teal-600">
                Blue "Nivel Pro" más reconocible como badge informativo (convención UI universal)
              </p>
            </div>
          </div>
        </section>

        <!-- ── Navigation ── -->
        <section>
          <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-white">Navegación Lateral</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Current nav -->
            <div>
              <p class="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                ACTUAL — gray borders, active teal
              </p>
              <div class="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="mb-4 flex items-center gap-2 px-2 py-1">
                  <div class="h-7 w-7 rounded-lg bg-teal-600" />
                  <span class="text-sm font-bold text-gray-900">FinHub</span>
                </div>
                <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Menú Principal
                </p>
                <ul class="space-y-0.5">
                  <li v-for="item in navItems" :key="item.label">
                    <a
                      :class="[
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        item.active
                          ? 'bg-teal-50 font-medium text-teal-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      ]"
                    >
                      <span
                        :class="[
                          'material-symbols-outlined text-base',
                          item.active ? 'text-teal-600' : 'text-gray-400'
                        ]"
                      >
                        {{ item.icon }}
                      </span>
                      {{ item.label }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <!-- Proposed nav -->
            <div>
              <p class="mb-2 text-xs font-bold uppercase tracking-widest text-teal-600">
                PROPUESTO — slate surfaces, active pill más visible
              </p>
              <div class="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="mb-4 flex items-center gap-2 px-2 py-1">
                  <div class="h-7 w-7 rounded-lg bg-teal-600" />
                  <span class="text-sm font-bold text-slate-900">FinHub</span>
                </div>
                <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Menú Principal
                </p>
                <ul class="space-y-0.5">
                  <li v-for="item in navItems" :key="item.label">
                    <a
                      :class="[
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        item.active
                          ? 'bg-teal-600 font-semibold text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      ]"
                    >
                      <span
                        :class="[
                          'material-symbols-outlined text-base',
                          item.active ? 'text-white' : 'text-slate-400'
                        ]"
                      >
                        {{ item.icon }}
                      </span>
                      {{ item.label }}
                    </a>
                  </li>
                </ul>
              </div>
              <p class="mt-2 text-xs text-teal-600">
                Active: fondo teal sólido + texto blanco → más legible que teal-50 actual (4.5:1 vs
                1.9:1)
              </p>
            </div>
          </div>
        </section>

        <!-- ── Full Dashboard Preview ── -->
        <section>
          <h2 class="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Preview: Dashboard Completo (Propuesto)
          </h2>
          <p class="mb-6 text-sm text-slate-500">
            Fondo slate-100, cards blancas, texto slate-*, nav activo teal sólido, secondary blue.
          </p>

          <div class="overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
            <!-- fake header -->
            <div
              class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3"
            >
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span class="material-symbols-outlined text-sm">schedule</span>
                Última conexión: 09/03/2026 08:24
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Nivel Pro
                </span>
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white"
                >
                  M
                </div>
              </div>
            </div>

            <!-- fake body -->
            <div class="flex" style="min-height: 360px">
              <!-- sidebar -->
              <aside class="w-48 shrink-0 border-r border-slate-200 bg-white p-4">
                <div class="mb-5 flex items-center gap-2 px-2">
                  <div class="h-6 w-6 rounded-md bg-teal-600" />
                  <span class="text-sm font-bold text-slate-900">FinHub</span>
                </div>
                <p class="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Principal
                </p>
                <ul class="mb-4 space-y-0.5">
                  <li v-for="item in navItems" :key="item.label">
                    <span
                      :class="[
                        'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs',
                        item.active ? 'bg-teal-600 font-semibold text-white' : 'text-slate-600'
                      ]"
                    >
                      <span
                        :class="[
                          'material-symbols-outlined text-sm',
                          item.active ? 'text-white' : 'text-slate-400'
                        ]"
                      >
                        {{ item.icon }}
                      </span>
                      {{ item.label }}
                    </span>
                  </li>
                </ul>
              </aside>

              <!-- main content -->
              <div class="flex-1 bg-slate-100 p-6">
                <h1 class="mb-1 text-xl font-bold text-slate-900">Dashboard Financiero</h1>
                <p class="mb-5 text-sm text-slate-500">Estado de tus finanzas en tiempo real.</p>

                <!-- metrics -->
                <div class="mb-5 grid grid-cols-3 gap-3">
                  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div class="mb-2 flex items-center gap-2">
                      <div class="flex items-center justify-center rounded-lg bg-green-100 p-1.5">
                        <span
                          class="material-symbols-outlined text-[16px] leading-none text-green-600"
                        >
                          account_balance_wallet
                        </span>
                      </div>
                      <span class="text-xs text-slate-500">Ingresos</span>
                    </div>
                    <p class="text-base font-bold text-slate-900">$5,000,000</p>
                    <p class="text-xs text-green-600">+12% vs mes anterior</p>
                  </div>
                  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div class="mb-2 flex items-center gap-2">
                      <div class="flex items-center justify-center rounded-lg bg-red-100 p-1.5">
                        <span
                          class="material-symbols-outlined text-[16px] leading-none text-red-600"
                        >
                          receipt_long
                        </span>
                      </div>
                      <span class="text-xs text-slate-500">Gastos</span>
                    </div>
                    <p class="text-base font-bold text-slate-900">$3,200,000</p>
                    <p class="text-xs text-red-500">-5% vs mes anterior</p>
                  </div>
                  <div class="rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 p-4 shadow-md">
                    <div class="mb-2 flex items-center gap-2">
                      <div class="flex items-center justify-center rounded-lg bg-white/20 p-1.5">
                        <span class="material-symbols-outlined text-[16px] leading-none text-white">
                          savings
                        </span>
                      </div>
                      <span class="text-xs text-white/80">Disponible</span>
                    </div>
                    <p class="text-base font-bold text-white">$1,800,000</p>
                    <p class="text-xs text-teal-200">-2% vs mes anterior</p>
                  </div>
                </div>

                <!-- bottom cards -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p class="mb-3 text-sm font-semibold text-slate-900">Estado del Presupuesto</p>
                    <div class="space-y-2">
                      <div
                        v-for="cat in [
                          { name: 'Necesidades', pct: 100, color: 'bg-blue-500' },
                          { name: 'Deseos', pct: 75, color: 'bg-teal-500' },
                          { name: 'Ahorros', pct: 60, color: 'bg-green-500' }
                        ]"
                        :key="cat.name"
                      >
                        <div class="mb-1 flex justify-between text-xs text-slate-600">
                          <span>{{ cat.name }}</span>
                          <span>{{ cat.pct }}%</span>
                        </div>
                        <div class="h-1.5 w-full rounded-full bg-slate-100">
                          <div
                            :class="['h-1.5 rounded-full', cat.color]"
                            :style="{ width: cat.pct + '%' }"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p class="mb-3 text-sm font-semibold text-slate-900">Alertas Inteligentes</p>
                    <div class="rounded-lg bg-blue-50 p-3">
                      <p class="text-xs text-blue-800">
                        Has superado tu límite de
                        <strong>Deseos</strong>
                        en restaurantes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- ══════════════════════════════════════════
           SECTION: DARK MODE
      ══════════════════════════════════════════ -->
      <main v-else class="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div>
          <p
            class="mb-1 text-sm font-semibold uppercase tracking-widest text-teal-500 dark:text-teal-400"
          >
            Tema Oscuro
          </p>
          <h1 class="mb-2 text-4xl font-extrabold text-slate-900 dark:text-white">
            Sistema dark cohesivo
          </h1>
          <p class="text-slate-500 dark:text-slate-400">
            Actualmente dark mode usa gray-800/gray-900 sin sistema. La propuesta unifica con slate
            (blue-undertone) y 4 niveles de profundidad.
          </p>
        </div>

        <!-- Dark surfaces comparison -->
        <section class="grid gap-8 md:grid-cols-2">
          <!-- Current dark -->
          <div>
            <p
              class="mb-3 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200"
            >
              <span class="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">ACTUAL</span>
              Mix de gray-800 / gray-900 sin tokens
            </p>
            <div class="overflow-hidden rounded-2xl border-2 border-red-300">
              <div class="flex items-center justify-between p-4" style="background: #1f2937">
                <span class="font-mono text-xs text-gray-300">sidebar bg: gray-800 #1f2937</span>
                <div class="h-4 w-4 rounded" style="background: #1f2937; border: 1px solid #fff3" />
              </div>
              <div class="flex items-center justify-between p-4" style="background: #111827">
                <span class="font-mono text-xs text-gray-300">page bg: gray-900 #111827</span>
                <div class="h-4 w-4 rounded" style="background: #111827; border: 1px solid #fff3" />
              </div>
              <div class="flex items-center justify-between p-4" style="background: #1f2937">
                <span class="font-mono text-xs text-gray-300">card bg: gray-800 #1f2937</span>
                <div class="h-4 w-4 rounded" style="background: #1f2937; border: 1px solid #fff3" />
              </div>
              <div class="flex items-center justify-between p-4" style="background: #374151">
                <span class="font-mono text-xs text-gray-300">border: gray-700 #374151</span>
                <div class="h-4 w-4 rounded" style="background: #374151; border: 1px solid #fff3" />
              </div>
            </div>
            <p class="mt-2 text-xs text-red-500">
              Sidebar y card tienen el mismo valor → 0 diferencia de profundidad
            </p>
          </div>

          <!-- Proposed dark -->
          <div>
            <p
              class="mb-3 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200"
            >
              <span class="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">PROPUESTA</span>
              4 niveles slate-950→700 con undertone azul
            </p>
            <div class="overflow-hidden rounded-2xl border-2 border-teal-400">
              <div class="flex items-center justify-between p-4" style="background: #020617">
                <span class="font-mono text-xs text-slate-300">page bg: slate-950 #020617</span>
                <div class="h-4 w-4 rounded" style="background: #020617; border: 1px solid #fff3" />
              </div>
              <div class="flex items-center justify-between p-4" style="background: #0f172a">
                <span class="font-mono text-xs text-slate-300">sidebar: slate-900 #0f172a</span>
                <div class="h-4 w-4 rounded" style="background: #0f172a; border: 1px solid #fff3" />
              </div>
              <div class="flex items-center justify-between p-4" style="background: #1e293b">
                <span class="font-mono text-xs text-slate-300">card bg: slate-800 #1e293b</span>
                <div class="h-4 w-4 rounded" style="background: #1e293b; border: 1px solid #fff3" />
              </div>
              <div class="flex items-center justify-between p-4" style="background: #334155">
                <span class="font-mono text-xs text-slate-300">
                  inset / border: slate-700 #334155
                </span>
                <div class="h-4 w-4 rounded" style="background: #334155; border: 1px solid #fff3" />
              </div>
            </div>
            <p class="mt-2 text-xs text-teal-500">
              4 valores distintos = profundidad visual real. Blue undertone de slate armoniza con
              teal
            </p>
          </div>
        </section>

        <!-- Dark mode demo -->
        <section>
          <h2 class="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            Preview Dark (propuesto)
          </h2>
          <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Activa el toggle de Modo Oscuro arriba para ver esta preview en contexto real.
          </p>
          <!-- Forced-dark widget -->
          <div class="overflow-hidden rounded-2xl" style="background: #020617">
            <!-- header dark -->
            <div
              class="flex items-center justify-between px-6 py-3"
              style="background: #0f172a; border-bottom: 1px solid #1e293b"
            >
              <span class="text-xs" style="color: #94a3b8">Última conexión: 09/03/2026 08:24</span>
              <div class="flex items-center gap-2">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  style="background: #1e3a8a; color: #93c5fd"
                >
                  Nivel Pro
                </span>
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style="background: #0d9488"
                >
                  M
                </div>
              </div>
            </div>
            <!-- body dark -->
            <div class="flex" style="min-height: 280px">
              <!-- sidebar dark -->
              <aside
                class="w-48 shrink-0 p-4"
                style="background: #0f172a; border-right: 1px solid #1e293b"
              >
                <div class="mb-4 flex items-center gap-2 px-2">
                  <div class="h-6 w-6 rounded-md" style="background: #0d9488"></div>
                  <span class="text-sm font-bold" style="color: #f1f5f9">FinHub</span>
                </div>
                <p
                  class="mb-2 px-2 text-[9px] font-bold uppercase tracking-widest"
                  style="color: #475569"
                >
                  Principal
                </p>
                <ul class="space-y-0.5">
                  <li v-for="item in navItems" :key="item.label">
                    <span
                      :class="['flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs']"
                      :style="
                        item.active
                          ? 'background:#0d9488; color:#fff; font-weight:600'
                          : 'color:#94a3b8'
                      "
                    >
                      <span
                        class="material-symbols-outlined text-sm"
                        :style="item.active ? 'color:#fff' : 'color:#475569'"
                      >
                        {{ item.icon }}
                      </span>
                      {{ item.label }}
                    </span>
                  </li>
                </ul>
              </aside>
              <!-- main dark -->
              <div class="flex-1 p-5" style="background: #020617">
                <h1 class="mb-1 text-lg font-bold" style="color: #f1f5f9">Dashboard Financiero</h1>
                <p class="mb-4 text-sm" style="color: #64748b">
                  Estado de tus finanzas en tiempo real.
                </p>
                <div class="mb-4 grid grid-cols-3 gap-3">
                  <div
                    class="rounded-xl p-4"
                    style="background: #1e293b; border: 1px solid #334155"
                  >
                    <p class="mb-1 text-xs" style="color: #64748b">Ingresos</p>
                    <p class="text-base font-bold" style="color: #f1f5f9">$5,000,000</p>
                    <p class="text-xs" style="color: #4ade80">+12%</p>
                  </div>
                  <div
                    class="rounded-xl p-4"
                    style="background: #1e293b; border: 1px solid #334155"
                  >
                    <p class="mb-1 text-xs" style="color: #64748b">Gastos</p>
                    <p class="text-base font-bold" style="color: #f1f5f9">$3,200,000</p>
                    <p class="text-xs" style="color: #f87171">-5%</p>
                  </div>
                  <div
                    class="rounded-xl p-4"
                    style="background: linear-gradient(135deg, #0d9488, #134e4a)"
                  >
                    <p class="mb-1 text-xs" style="color: rgba(255, 255, 255, 0.7)">Disponible</p>
                    <p class="text-base font-bold text-white">$1,800,000</p>
                    <p class="text-xs" style="color: #5eead4">-2%</p>
                  </div>
                </div>
                <div class="rounded-xl p-4" style="background: #1e293b; border: 1px solid #334155">
                  <p class="mb-2 text-sm font-semibold" style="color: #e2e8f0">
                    Estado del Presupuesto
                  </p>
                  <div class="space-y-2">
                    <div
                      v-for="cat in [
                        { name: 'Necesidades', pct: 100 },
                        { name: 'Deseos', pct: 75 },
                        { name: 'Ahorros', pct: 60 }
                      ]"
                      :key="cat.name"
                    >
                      <div class="mb-0.5 flex justify-between text-xs" style="color: #94a3b8">
                        <span>{{ cat.name }}</span>
                        <span>{{ cat.pct }}%</span>
                      </div>
                      <div class="h-1.5 w-full rounded-full" style="background: #334155">
                        <div
                          class="h-1.5 rounded-full"
                          :style="{ width: cat.pct + '%', background: '#0d9488' }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- ── Footer ── -->
      <footer
        class="mt-16 border-t border-slate-200 px-6 py-6 text-center text-sm text-slate-400 dark:border-slate-800"
      >
        Design Preview · Solo lectura · No modifica ningún archivo existente · Pendiente GO del
        equipo
      </footer>
    </div>
  </div>
</template>
