<script setup lang="ts">
  import Icon from '@/components/atoms/icons/Icon.vue'
  import Link from '@/components/atoms/typography/Link.vue'
  import Text from '@/components/atoms/typography/Text.vue'

  import type { NavigationItemProps } from './types/navigation-item.types'

  defineOptions({ inheritAttrs: false })

  const props = withDefaults(defineProps<NavigationItemProps>(), {
    isActive: false,
    collapsed: false,
    className: '',
    badge: undefined,
    onClick: undefined
  })

  const emit = defineEmits<{
    click: []
    navigate: []
  }>()

  const hasBadge = computed(() => props.badge !== undefined && props.badge > 0)
  const badgeLabel = computed(() => ((props.badge ?? 0) > 99 ? '99+' : String(props.badge)))

  const handleClick = async () => {
    emit('click')
    emit('navigate')

    if (props.onClick) {
      await props.onClick()
    }
  }
</script>

<template>
  <template v-if="collapsed">
    <Link
      v-if="path"
      :to="path"
      :title="name"
      :class="[
        'nav-item',
        isActive ? 'nav-item--active' : 'nav-item--inactive',
        'justify-center px-0',
        className
      ]"
      @click="emit('navigate')"
    >
      <Icon :name="icon" size="lg" />
    </Link>
    <button
      v-else
      type="button"
      :title="name"
      :class="['nav-item nav-item--inactive w-full justify-center px-0', className]"
      @click="handleClick"
    >
      <Icon :name="icon" size="lg" />
    </button>
  </template>

  <template v-else>
    <Link
      v-if="path"
      :to="path"
      :class="[
        'nav-item gap-3 px-3',
        isActive ? 'nav-item--active' : 'nav-item--inactive',
        className
      ]"
      @click="emit('navigate')"
    >
      <Icon :name="icon" size="lg" />
      <Text size="xs" color="inherit" weight="medium" class="nav-item__label">
        {{ name }}
      </Text>
      <span v-if="hasBadge" class="nav-item__badge">{{ badgeLabel }}</span>
    </Link>
    <button
      v-else
      type="button"
      :class="['nav-item nav-item--inactive w-full gap-3 px-3', className]"
      @click="handleClick"
    >
      <Icon :name="icon" size="lg" />
      <Text size="xs" color="inherit" weight="medium" class="nav-item__label">
        {{ name }}
      </Text>
      <span v-if="hasBadge" class="nav-item__badge">{{ badgeLabel }}</span>
    </button>
  </template>
</template>

<style lang="postcss" scoped>
  .nav-item {
    @apply flex items-center rounded py-2 outline-none transition-all duration-200 2xl:py-2.5;
  }

  .nav-item__label {
    @apply 2xl:text-sm;
  }
  .nav-item--active {
    @apply rounded-md border-y-0 border-l-8 border-r-0 border-primary-900 bg-slate-200 font-bold text-primary-900;
    @apply hover:bg-primary-900 hover:text-white;
    @apply dark:bg-primary-600 dark:text-white dark:hover:bg-primary-900;
  }
  .nav-item--inactive {
    @apply rounded-r-none text-slate-600 hover:border-l-8 hover:border-primary-900 hover:bg-slate-200 hover:text-primary-900;
    @apply active:bg-primary-100;
    @apply dark:text-slate-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-300;
    @apply dark:active:bg-primary-900/30;
  }
  .nav-item--disabled {
    @apply pointer-events-none cursor-not-allowed opacity-50;
  }
  .nav-item__badge {
    @apply ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white;
  }
  .nav-item--sub {
    @apply ml-3 border-l-2 border-slate-200 pl-3 dark:border-slate-700;
  }
</style>
