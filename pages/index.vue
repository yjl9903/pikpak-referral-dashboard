<script setup lang="ts">
import { usePikPakComissionsSummary } from '~/stores/comissions';

const cardUI = {
  root: 'shadow-xs',
  body: '!px-4 !py-3 space-y-1'
};

const summary = usePikPakComissionsSummary();

const { currentAccounts } = toRefs(usePikPakAccounts());

function formatDate(date: Date): string {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const today = new Date();
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const todayStr = formatDate(today);
const thirtyDaysAgoStr = formatDate(thirtyDaysAgo);

const range = ref<{ from: string; to: string[] }>({ from: thirtyDaysAgoStr, to: todayStr });

const {
  data: daily,
  pending: dailyPending,
  refresh: refreshDaily
} = useAsyncData('pikpak_comissions_daily', async () => {
  const daily = await Promise.all(
    currentAccounts.value.map((account) => account.getCommissionsDaily({ ...range.value }))
  );

  const merged = mergeDailyCommissionStats(...daily);

  return merged;

  function mergeDailyCommissionStats(
    ...groups: readonly DailyCommissionStats[][]
  ): DailyCommissionStats[] {
    if (groups.length <= 1) return groups[0] ?? [];

    const acc = new Map<string, DailyCommissionStats>();

    for (const group of groups) {
      for (const item of group) {
        const existing = acc.get(item.day);
        if (existing) {
          existing.new_users += item.new_users;
          existing.paid_users += item.paid_users;
          existing.paid_amount += item.paid_amount;
          existing.paid_amount_commission += item.paid_amount_commission;
        } else {
          acc.set(item.day, { ...item });
        }
      }
    }

    return [...acc.values()].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  }
});

watch(currentAccounts, () => {
  refreshDaily();
});

const dailySummary = computed(() => {
  const summary = {
    paid_users: 0,
    new_users: 0,
    paid_amount: 0,
    paid_amount_commission: 0
  };

  if (daily.value) {
    for (const item of daily.value) {
      summary.new_users += item.new_users;
      summary.paid_users += item.paid_users;
      summary.paid_amount += item.paid_amount;
      summary.paid_amount_commission += item.paid_amount_commission;
    }
  }

  return summary;
});
</script>

<template>
  <div v-if="currentAccounts.length > 0" class="">
    <div class="">
      <h2 class="text-2xl font-bold">总览</h2>
    </div>
    <div v-if="!summary.pending" class="mt-4 grid grid-cols-4 gap-4 *:bg-gradient-to-t">
      <UCard :ui="cardUI">
        <div>
          <span class="text-muted-foreground text-sm">总收益</span>
        </div>
        <div class="text-2xl font-semibold tabular-nums">
          <span>{{ summary.summary.total.toFixed(2) }}</span>
          <span class="text-base"> SGD</span>
        </div>
      </UCard>

      <UCard :ui="cardUI">
        <div>
          <span class="text-muted-foreground text-sm">待处理收益</span>
        </div>
        <div class="text-2xl font-semibold tabular-nums">
          <span>{{ summary.summary.pending.toFixed(2) }}</span>
          <span class="text-base"> SGD</span>
        </div>
      </UCard>

      <UCard :ui="cardUI">
        <div>
          <span class="text-muted-foreground text-sm">可提现收益</span>
        </div>
        <div class="text-2xl font-semibold tabular-nums">
          <span>{{ summary.summary.available.toFixed(2) }}</span>
          <span class="text-base"> SGD</span>
        </div>
      </UCard>

      <div></div>
    </div>
    <div v-else>
      <USkeleton class="h-[96px] w-full" />
    </div>

    <div v-if="daily" class="mt-4 grid grid-cols-4 gap-4 *:bg-gradient-to-t">
      <UCard :ui="cardUI">
        <div>
          <span class="text-muted-foreground text-sm">最近 30 天收益</span>
        </div>
        <div class="text-2xl font-semibold tabular-nums">
          <span>{{ dailySummary.paid_amount_commission.toFixed(2) }}</span>
          <span class="text-base"> SGD</span>
          <span class="text-base"> / </span>
          <span class="text-base">{{ dailySummary.paid_amount.toFixed(2) }}</span>
          <span class="text-base"> SGD</span>
        </div>
      </UCard>

      <!-- <UCard :ui="cardUI">
        <div>
          <span class="text-muted-foreground text-sm">最近 30 天付费金额</span>
        </div>
        <div class="text-2xl font-semibold tabular-nums">
          <span>{{ dailySummary.paid_amount.toFixed(2) }}</span>
          <span class="text-base"> SGD</span>
        </div>
      </UCard> -->

      <UCard :ui="cardUI">
        <div>
          <span class="text-muted-foreground text-sm">最近 30 天付费用户</span>
        </div>
        <div class="text-2xl font-semibold tabular-nums">
          <span>{{ dailySummary.paid_users }}</span>
          <!-- <span class="text-base"> SGD</span> -->
        </div>
      </UCard>

      <UCard :ui="cardUI">
        <div>
          <span class="text-muted-foreground text-sm">最近 30 天新用户</span>
        </div>
        <div class="text-2xl font-semibold tabular-nums">
          <span>{{ dailySummary.new_users }}</span>
          <!-- <span class="text-base"> SGD</span> -->
        </div>
      </UCard>

      <div></div>
    </div>
    <div v-else>
      <USkeleton class="mt-4 h-[96px] w-full" />
    </div>

    <div class="mt-8">
      <h2 class="text-2xl font-bold">收益情况</h2>
    </div>
    <div v-if="daily" class="mt-4">
      <DailyChart
        :daily="daily"
        :field="{ key: 'paid_amount_commission', name: '佣金金额', color: '#ee8448' }"
      ></DailyChart>
    </div>
    <div v-else>
      <USkeleton class="mt-4 h-[300px] w-full" />
    </div>

    <div class="mt-8">
      <h2 class="text-2xl font-bold">付费人数</h2>
    </div>
    <div v-if="daily" class="mt-4">
      <DailyChart
        :daily="daily"
        :field="{ key: 'paid_users', name: '付费人数', color: '#63d1be' }"
      ></DailyChart>
    </div>
    <div v-else>
      <USkeleton class="mt-4 h-[300px] w-full" />
    </div>

    <div class="mt-8">
      <h2 class="text-2xl font-bold">新增用户数</h2>
    </div>
    <div v-if="daily" class="mt-4">
      <DailyChart
        :daily="daily"
        :field="{ key: 'new_users', name: '新增用户数', color: '#406df6' }"
      ></DailyChart>
    </div>
    <div v-else>
      <USkeleton class="mt-4 h-[300px] w-full" />
    </div>
  </div>
</template>
