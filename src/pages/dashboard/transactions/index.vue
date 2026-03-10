<script setup lang="ts">
  import { DashboardPlaceholder } from '~/components/organisms'

  definePageMeta({
    layout: 'dashboard'
  })
</script>

<template>
  <DashboardPlaceholder
    title="Transacciones"
    description="Gestiona y visualiza todas tus transacciones financieras"
    icon="receipt_long"
  />
</template>
