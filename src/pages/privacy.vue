<script setup lang="ts">
  definePageMeta({
    layout: 'public',
    auth: false
  })
</script>

<template>
  <article class="privacy">
    <header class="privacy__header">
      <h1 class="privacy__title">Política de Privacidad</h1>
      <p class="privacy__subtitle">Mi Comodoro — App de finanzas personales</p>
    </header>

    <section class="privacy__section">
      <h2 class="privacy__section-title">1. Responsable del tratamiento</h2>
      <p class="privacy__text">
        Mi Comodoro es una aplicación de finanzas personales desarrollada y operada por Miguel
        Álvarez. Para cualquier consulta relacionada con el tratamiento de datos personales, puedes
        escribir a:
        <a href="mailto:ing.migueljalvarez@gmail.com" class="privacy__link">
          ing.migueljalvarez@gmail.com
        </a>
      </p>
    </section>

    <section class="privacy__section">
      <h2 class="privacy__section-title">2. Datos recolectados</h2>
      <p class="privacy__text">
        Al autenticarse mediante Google OAuth, Mi Comodoro puede recibir los siguientes datos:
      </p>
      <ul class="privacy__list">
        <li class="privacy__list-item">
          <strong>Nombre y correo electrónico</strong> — requeridos para identificar tu cuenta y
          personalizar la experiencia.
        </li>
        <li class="privacy__list-item">
          <strong>Imagen de perfil</strong> — opcional; el usuario puede rechazar su uso sin que
          esto afecte el acceso a la aplicación.
        </li>
      </ul>
    </section>

    <section class="privacy__section">
      <h2 class="privacy__section-title">3. Finalidad del tratamiento</h2>
      <ul class="privacy__list">
        <li class="privacy__list-item">
          Personalizar la experiencia dentro de la aplicación.
        </li>
        <li class="privacy__list-item">
          Identificar de forma segura tu sesión y cuenta.
        </li>
        <li class="privacy__list-item">
          <strong>Los datos NO se comparten, venden ni transfieren a terceros</strong> bajo ninguna
          circunstancia.
        </li>
      </ul>
    </section>

    <section class="privacy__section">
      <h2 class="privacy__section-title">4. Base legal</h2>
      <p class="privacy__text">
        El tratamiento de datos se realiza con base en el
        <strong>consentimiento libre, previo, expreso e informado</strong> del titular, en
        cumplimiento de la <strong>Ley 1581 de 2012</strong> (Habeas Data) y el Decreto 1377 de
        2013 de la República de Colombia.
      </p>
    </section>

    <section class="privacy__section">
      <h2 class="privacy__section-title">5. Derechos del titular (ARCO)</h2>
      <p class="privacy__text">
        Como titular de los datos, tienes derecho a:
      </p>
      <ul class="privacy__list">
        <li class="privacy__list-item">
          <strong>Acceso:</strong> conocer qué datos tuyos están siendo tratados.
        </li>
        <li class="privacy__list-item">
          <strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.
        </li>
        <li class="privacy__list-item">
          <strong>Cancelación:</strong> solicitar la supresión de tus datos cuando no sean
          necesarios para la finalidad declarada.
        </li>
        <li class="privacy__list-item">
          <strong>Oposición:</strong> oponerte al tratamiento de tus datos en los casos previstos
          por la ley.
        </li>
      </ul>
      <p class="privacy__text">
        Para ejercer cualquiera de estos derechos, escríbenos a:
        <a href="mailto:ing.migueljalvarez@gmail.com" class="privacy__link">
          ing.migueljalvarez@gmail.com
        </a>
      </p>
    </section>

    <section class="privacy__section">
      <h2 class="privacy__section-title">6. Imagen de perfil</h2>
      <p class="privacy__text">
        El uso de tu foto de perfil de Google es completamente <strong>opcional</strong>. No estás
        obligado a autorizar su uso para acceder a Mi Comodoro. Puedes iniciar sesión y utilizar
        todas las funciones de la aplicación sin que tu imagen sea procesada ni almacenada.
      </p>
    </section>

    <section class="privacy__section">
      <h2 class="privacy__section-title">7. Vigencia de la política</h2>
      <p class="privacy__text">
        Esta política de privacidad rige a partir del <strong>15 de mayo de 2025</strong> y puede
        ser actualizada para reflejar cambios en la legislación o en las prácticas de tratamiento de
        datos. Cualquier modificación será notificada dentro de la aplicación.
      </p>
    </section>
  </article>
</template>

<style scoped lang="postcss">
  .privacy {
    @apply flex flex-col gap-8;
  }

  .privacy__header {
    @apply border-b border-neutral-200 pb-6;
    @apply dark:border-neutral-700;
  }

  .privacy__title {
    @apply text-3xl font-extrabold text-neutral-900;
    @apply dark:text-neutral-100;
  }

  .privacy__subtitle {
    @apply mt-1 text-sm text-neutral-500;
    @apply dark:text-neutral-400;
  }

  .privacy__section {
    @apply flex flex-col gap-3;
  }

  .privacy__section-title {
    @apply text-lg font-semibold text-neutral-800;
    @apply dark:text-neutral-200;
  }

  .privacy__text {
    @apply text-sm leading-relaxed text-neutral-600;
    @apply dark:text-neutral-300;
  }

  .privacy__list {
    @apply flex flex-col gap-2 pl-5;
  }

  .privacy__list-item {
    @apply list-disc text-sm leading-relaxed text-neutral-600;
    @apply dark:text-neutral-300;
  }

  .privacy__link {
    @apply text-primary-600 underline underline-offset-2;
    @apply hover:text-primary-700;
    @apply dark:text-primary-400 dark:hover:text-primary-300;
  }
</style>
