<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Redemption } from '~/utils/pikpak';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    redemptions: Redemption[] | undefined | null;
  }>(),
  { loading: false }
);

const exchange = useCurrencyStore();

const data = computed(() => {
  const total_amount = (props.redemptions ?? [])
    .filter((r) => r.status === 'SUCCEED')
    .reduce((acc, cur) => acc + cur.amount, 0);

  return [
    ...[...(props.redemptions ?? [])].reverse(),
    <Redemption>{
      time: '总计',
      id: '$total',
      method: '',
      account: '',
      amount: total_amount,
      status: 'SUCCEED'
    }
  ];
});

const columns: TableColumn<Redemption>[] = [
  {
    accessorKey: 'time',
    header: '日期',
    meta: {
      class: {
        td: 'w-[120px]'
      }
    }
  },
  {
    accessorKey: 'account',
    header: '收款账号'
  },
  {
    accessorKey: 'amount',
    header: '提现金额'
  },
  {
    accessorKey: 'status',
    header: '订单状态'
  }
];
</script>

<template>
  <UTable v-if="!loading && redemptions" :data="data" :columns="columns">
    <template #time-cell="{ row }">
      <span v-if="row.original.id !== '$total'">{{
        new Date(row.original.time).toLocaleDateString('sv-SE')
      }}</span>
      <span v-else class="font-bold">总计</span>
    </template>
    <template #amount-cell="{ row }">
      <span :class="{ 'font-bold': row.original.id === '$total' }">
        <span>{{ exchange.formatAmount(row.original.amount) }}</span>
        <span>&nbsp;{{ exchange.currentCurrency.code }}</span>
      </span>
    </template>
    <template #status-cell="{ row }">
      <span v-if="row.original.id === '$total'"> </span>
      <span v-else-if="row.original.status === 'SUCCEED'">
        <span class="text-green-500">成功</span>
      </span>
      <span v-else-if="row.original.status === 'PENDING'">
        <span class="text-yellow-500">待处理</span>
      </span>
      <span v-else-if="row.original.status === 'ERROR'">
        <span class="text-red-500">失败</span>
      </span>
    </template>
  </UTable>
  <USkeleton v-else-if="loading" class="h-[300px] w-full" />
</template>
