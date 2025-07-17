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
  // const new_users = (props.daily ?? []).reduce((acc, cur) => acc + cur.new_users, 0);
  // const paid_users = (props.daily ?? []).reduce((acc, cur) => acc + cur.paid_users, 0);
  // const paid_amount = (props.daily ?? []).reduce((acc, cur) => acc + cur.paid_amount, 0);
  // const paid_amount_commission = (props.daily ?? []).reduce(
  //   (acc, cur) => acc + cur.paid_amount_commission,
  //   0
  // );

  return [
    ...[...(props.redemptions ?? [])].reverse()
    // { day: '总计', new_users, paid_users, paid_amount, paid_amount_commission }
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
      <span>{{ new Date(row.original.time).toLocaleDateString('sv-SE') }}</span>
    </template>
    <template #amount-cell="{ row }">
      <span>{{ exchange.formatAmount(row.original.amount) }}</span>
      <span>&nbsp;{{ exchange.currentCurrency.code }}</span>
    </template>
    <template #status-cell="{ row }">
      <span v-if="row.original.status === 'SUCCEED'">
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
