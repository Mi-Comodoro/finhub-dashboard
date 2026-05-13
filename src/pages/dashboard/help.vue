<script setup lang="ts">
  import { ref } from 'vue'

  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import { FAQ_ITEMS, GLOSSARY_TERMS } from '@/data/helpContent'

  definePageMeta({
    layout: 'dashboard',
    title: 'Ayuda',
    breadcrumb: 'Ayuda'
  })

  type ActiveTab = 'faq' | 'glossary'

  const activeTab = ref<ActiveTab>('faq')
  const openFaqId = ref<number | null>(null)

  const toggleFaq = (id: number) => {
    openFaqId.value = openFaqId.value === id ? null : id
  }
</script>

<template>
  <div class="help-page">
    <!-- Header -->
    <div class="help-page__header">
      <CardInfo
        title="Centro de Ayuda"
        sub-title="Resuelve tus dudas y conoce los términos clave de tu finanzas"
        icon="help_outline"
        title-size="xl"
        weight="extrabold"
        level="h1"
        color="black"
        sub-title-size="xs"
        sub-title-color="muted"
        icon-size="md"
        icon-variant="primary"
      />
    </div>

    <!-- Tabs -->
    <div class="help-page__tabs">
      <button
        class="help-page__tab"
        :class="{ 'help-page__tab--active': activeTab === 'faq' }"
        @click="activeTab = 'faq'"
      >
        Preguntas Frecuentes
      </button>
      <button
        class="help-page__tab"
        :class="{ 'help-page__tab--active': activeTab === 'glossary' }"
        @click="activeTab = 'glossary'"
      >
        Glosario de Términos
      </button>
    </div>

    <!-- FAQ Section -->
    <section v-if="activeTab === 'faq'" class="help-page__section">
      <div class="help-page__faq-list">
        <div
          v-for="item in FAQ_ITEMS"
          :key="item.id"
          class="help-page__faq-item"
          :class="{ 'help-page__faq-item--open': openFaqId === item.id }"
        >
          <button class="help-page__faq-trigger" @click="toggleFaq(item.id)">
            <span class="help-page__faq-question">{{ item.question }}</span>
            <span class="help-page__faq-icon material-symbols-outlined">
              {{ openFaqId === item.id ? 'expand_less' : 'expand_more' }}
            </span>
          </button>
          <div v-if="openFaqId === item.id" class="help-page__faq-answer">
            <p class="help-page__faq-answer-text">{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Glossary Section -->
    <section v-else-if="activeTab === 'glossary'" class="help-page__section">
      <div class="help-page__glossary-list">
        <div v-for="entry in GLOSSARY_TERMS" :key="entry.term" class="help-page__glossary-item">
          <dt class="help-page__glossary-term">{{ entry.term }}</dt>
          <dd class="help-page__glossary-definition">{{ entry.definition }}</dd>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss">
  .help-page {
    @apply space-y-6 p-6;
  }

  .help-page__header {
    @apply rounded-xl border border-neutral-200 bg-white p-6;
  }

  /* Tabs */
  .help-page__tabs {
    @apply flex gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1;
    width: fit-content;
  }

  .help-page__tab {
    @apply rounded-md px-5 py-2 text-sm font-medium text-neutral-600 transition-all duration-150;
    @apply hover:text-neutral-900;
  }

  .help-page__tab--active {
    @apply bg-white text-primary-700 shadow-sm;
  }

  /* FAQ */
  .help-page__section {
    @apply rounded-xl border border-neutral-200 bg-white;
  }

  .help-page__faq-list {
    @apply divide-y divide-neutral-100;
  }

  .help-page__faq-item {
    @apply transition-colors duration-150;
  }

  .help-page__faq-item--open {
    @apply bg-primary-50;
  }

  .help-page__faq-trigger {
    @apply flex w-full items-center justify-between gap-4 px-6 py-5 text-left;
  }

  .help-page__faq-question {
    @apply text-sm font-semibold text-neutral-800;
  }

  .help-page__faq-icon {
    @apply flex-shrink-0 text-neutral-400 transition-transform duration-200;
    font-size: 1.25rem;
  }

  .help-page__faq-answer {
    @apply px-6 pb-5;
  }

  .help-page__faq-answer-text {
    @apply text-sm leading-relaxed text-neutral-600;
  }

  /* Glossary */
  .help-page__glossary-list {
    @apply divide-y divide-neutral-100;
  }

  .help-page__glossary-item {
    @apply grid grid-cols-12 gap-4 px-6 py-5;
  }

  .help-page__glossary-term {
    @apply col-span-12 text-sm font-semibold text-primary-700 md:col-span-3;
  }

  .help-page__glossary-definition {
    @apply col-span-12 text-sm leading-relaxed text-neutral-600 md:col-span-9;
  }
</style>
