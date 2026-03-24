<script lang="ts" setup>
  import type { LabelColor, LabelSize } from '@/components/atoms'

  import type { CardInfoProps } from './types/card-info.types'

  withDefaults(defineProps<CardInfoProps>(), {
    verticalSpace: false
  })
</script>
<template>
  <div class="card-info">
    <div class="card-info__header">
      <IconBadge v-if="icon" :icon="icon" :size="iconSize" :variant="iconVariant" />

      <div :class="verticalSpace ? 'flex flex-col space-y-2' : 'flex flex-col -space-y-1'">
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
