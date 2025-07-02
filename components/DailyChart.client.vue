<script setup lang="ts">
import { defineProps, toRefs } from 'vue';

import type { DailyCommissionStats } from '~/utils/pikpak';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    daily: DailyCommissionStats[] | undefined | null;
    field: { key: keyof DailyCommissionStats; name: string; color: string };
  }>(),
  { loading: false }
);

const { daily, field } = toRefs(props);

const exchange = useCurrencyStore();

const colorMode = useColorMode();

const categories = computed(() => ({
  [field.value.key]: {
    name: field.value.name,
    color: field.value.color
  }
}));

// const yAxis = ['paid_amount', 'paid_amount_commission'];
const yAxis = computed(() => [field.value.key]);

const isCount = computed(() => field.value.key === 'new_users' || field.value.key === 'paid_users');

const xFormatter = (i: number): string => {
  return `${daily.value?.[i]?.day ?? ''}`;
};

const yFormatter = (v: number) => {
  return isCount.value
    ? Math.round(v) + ''
    : `${exchange.formatAmount(v)} ${exchange.currentCurrency.code}`;
};
</script>

<template>
  <div>
    <BarChart
      v-if="!loading && daily"
      :key="colorMode.value"
      :data="daily"
      :height="300"
      :categories="categories"
      :y-axis="yAxis"
      :xNumTicks="Math.min(daily.length, 10)"
      :yNumTicks="5"
      :radius="4"
      :y-grid-line="true"
      :x-formatter="xFormatter"
      :y-formatter="yFormatter"
      :legend-position="LegendPosition.Top"
      :hide-legend="true"
    />
    <USkeleton v-else-if="loading" class="h-[300px] w-full" />
  </div>
</template>
