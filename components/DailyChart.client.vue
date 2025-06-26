<script setup lang="ts">
import { defineProps, toRefs } from 'vue';

import type { DailyCommissionStats } from '~/utils/pikpak';

const props = defineProps<{
  daily: DailyCommissionStats[];
  field: { key: keyof DailyCommissionStats; name: string; color: string };
}>();

const { daily, field } = toRefs(props);

const colorMode = useColorMode();

const categories = computed(() => ({
  [field.value.key]: {
    name: field.value.name,
    color: field.value.color
  }
}));

// const yAxis = ['paid_amount', 'paid_amount_commission'];
const yAxis = computed(() => [field.value.key]);

const xFormatter = (i: number): string => {
  return `${daily.value[i]?.day}`;
};
const yFormatter = (i: number) => {
  return i.toFixed(2);
};
</script>

<template>
  <BarChart
    :key="colorMode.value"
    :data="daily"
    :height="300"
    :categories="categories"
    :y-axis="yAxis"
    :xNumTicks="10"
    :radius="4"
    :y-grid-line="true"
    :x-formatter="xFormatter"
    :y-formatter="yFormatter"
    :legend-position="LegendPosition.Top"
    :hide-legend="false"
  />
</template>
