<script setup lang="ts">
import { defineProps, toRefs } from 'vue';

const props = defineProps<{ daily: DailyCommissionStats[] }>();
const { daily } = toRefs(props);

const colorMode = useColorMode();

const categories = computed(() => ({
  paid_amount: {
    name: '付费金额',
    color: '#4777f6'
  },
  paid_amount_commission: {
    name: '佣金金额',
    color: '#63d1be'
  }
}));

const yAxis = ['paid_amount', 'paid_amount_commission'];

const xFormatter = (i: number): string => {
  return `${daily.value[i]?.day}`;
};
const yFormatter = (i: number) => i;
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
