<script lang="ts" setup>
  import type { LabelColor, LabelSize } from '@/components/atoms'

  import type { CardInfoProps } from './types/card-info.types'

  defineProps<CardInfoProps>()
</script>
<template>
  <div class="card-info">
    <div class="card-info__header">
      <IconChip v-if="icon" :icon="icon" :size="iconSize" :variant="iconVariant" />

      <div class="-space-y-1">
        <Heading :level="level" :size="titleSize" :weight="weight" :color="color">
          {{ title }}
        </Heading>
        <Text
          v-if="!subTitleVariant"
          :size="subTitleSize"
          :color="subTitleColor"
          :weight="subTitleWeight"
        >
          {{ subTitle }}
        </Text>
        <Label
          v-else
          :size="subTitleSize as LabelSize"
          :variant="subTitleVariant"
          :color="subTitleColor as LabelColor"
        >
          {{ subTitle }}
        </Label>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .card-info {
    @apply flex flex-col;
  }
  .card-info__header {
    @apply flex items-center gap-2;
  }
</style>
