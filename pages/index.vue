<script setup lang="ts">
import { usePikPakComissionsSummary } from '~/stores/comissions';

const cardUI = {
  root: 'shadow-xs',
  body: 'px-2 py-1 sm:p-4 space-y-2'
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

const { data: daily, pending: dailyPending } = useAsyncData('pikpak_comissions_daily', async () => {
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
  <div v-if="currentAccounts.length > 0" class="space-y-8">
    <div v-if="!summary.pending" class="grid grid-cols-4 gap-4 *:bg-gradient-to-t">
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

    <div v-if="daily" class="grid grid-cols-4 gap-4 *:bg-gradient-to-t">
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
      <USkeleton class="h-[96px] w-full" />
    </div>

    <div v-if="daily">
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
    </div>
    <div v-else>
      <USkeleton class="h-[300px] w-full" />
    </div>
  </div>
</template>
