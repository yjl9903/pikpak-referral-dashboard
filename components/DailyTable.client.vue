<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { DailyCommissionStats } from '~/utils/pikpak';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    daily: DailyCommissionStats[] | undefined | null;
  }>(),
  { loading: false }
);

const data = computed(() => {
  const new_users = (props.daily ?? []).reduce((acc, cur) => acc + cur.new_users, 0);
  const paid_users = (props.daily ?? []).reduce((acc, cur) => acc + cur.paid_users, 0);
  const paid_amount = (props.daily ?? []).reduce((acc, cur) => acc + cur.paid_amount, 0);
  const paid_amount_commission = (props.daily ?? []).reduce(
    (acc, cur) => acc + cur.paid_amount_commission,
    0
  );

  return [
    ...(props.daily ?? []),
    { day: '总计', new_users, paid_users, paid_amount, paid_amount_commission }
  ];
});

const columns: TableColumn<DailyCommissionStats>[] = [
  {
    accessorKey: 'day',
    header: '日期'
  },
  {
    accessorKey: 'new_users',
    header: '新增用户数'
  },
  {
    accessorKey: 'paid_users',
    header: '付费用户数'
  },
  {
    accessorKey: 'paid_amount',
    header: '付费金额'
  },
  {
    accessorKey: 'paid_amount_commission',
    header: '收益金额'
  }
];
</script>

<template>
  <UTable v-if="!loading && daily" :data="data" :columns="columns">
    <template #day-cell="{ row }">
      <span v-if="row.original.day === '总计'" class="font-bold">{{ row.original.day }}</span>
      <span v-else>{{ row.original.day }}</span>
    </template>
    <template #paid_amount-cell="{ row }">
      <span>{{ row.original.paid_amount.toFixed(2) }} SGD</span>
    </template>
    <template #paid_amount_commission-cell="{ row }">
      <span>{{ row.original.paid_amount_commission.toFixed(2) }} SGD</span>
    </template>
  </UTable>
  <USkeleton v-else-if="loading" class="h-[300px] w-full" />
</template>
