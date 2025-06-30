<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui';

import { usePikPakComissionsSummary, usePikPakComissionsDaily } from '~/stores/comissions';

const cardUI = {
  root: 'shadow-xs',
  body: '!px-4 !py-3 space-y-1'
};

const { currentAccounts } = storeToRefs(usePikPakAccounts());

const summary = usePikPakComissionsSummary();

const dailyStore = usePikPakComissionsDaily();
const { daily, dailySummary, filters, range, pending: dailyPending } = storeToRefs(dailyStore);

const rangeFilters = computed(() => {
  const filters = dailyStore.filters;
  return [
    {
      label: '本周',
      value: filters.thisWeek.join(',')
    },
    {
      label: '最近 7 天',
      value: filters.last7Days.join(',')
    },
    {
      type: 'separator'
    },
    {
      label: '本月',
      value: filters.thisMonth.join(',')
    },
    {
      label: '最近 30 天',
      value: filters.last30Days.join(',')
    },
    {
      label: '最近 90 天',
      value: filters.last90Days.join(',')
    },
    {
      type: 'separator'
    },
    {
      label: '今年',
      value: filters.thisYear.join(',')
    },
    {
      label: '最近 6 个月',
      value: filters.last6Months.join(',')
    },
    {
      label: '最近 12 个月',
      value: filters.last12Months.join(',')
    },
    {
      type: 'separator'
    },
    {
      label: '自定义',
      value: '_'
    }
  ] satisfies SelectItem[];
});

const selectedFilter = computed({
  get() {
    return range.value.join(',');
  },
  set(newValue) {
    range.value = newValue.split(',') as [string, string];
  }
});
</script>

<template>
  <div v-if="currentAccounts.length > 0" class="">
    <div class="">
      <h2 class="text-2xl font-bold">总览</h2>
    </div>
    <div
      v-if="!summary.pending && summary.summary"
      class="mt-4 grid grid-cols-4 gap-8 *:bg-gradient-to-t"
    >
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
    <div v-else class="mt-4">
      <USkeleton class="h-[84px] w-full" />
    </div>

    <div class="mt-12 flex items-center gap-8">
      <h2 class="text-2xl font-bold">收益情况</h2>
      <div>
        <USelect
          v-model="selectedFilter"
          :items="rangeFilters"
          class="w-48"
          :ui="{ content: 'max-h-100' }"
        />
      </div>
    </div>
    <div v-if="!dailyPending && daily" class="mt-4 grid grid-cols-4 gap-8 *:bg-gradient-to-t">
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
    </div>
    <div v-else class="mt-4">
      <USkeleton class="h-[84px] w-full" />
    </div>

    <div class="mt-6">
      <h2 class="text-xl font-bold">收益金额</h2>
    </div>
    <DailyChart
      class="mt-4"
      :loading="dailyPending"
      :daily="daily"
      :field="{ key: 'paid_amount_commission', name: '收益金额', color: '#ee8448' }"
    ></DailyChart>

    <div class="mt-6">
      <h2 class="text-xl font-bold">付费人数</h2>
    </div>
    <DailyChart
      class="mt-4"
      :loading="dailyPending"
      :daily="daily"
      :field="{ key: 'paid_users', name: '付费人数', color: '#63d1be' }"
    ></DailyChart>

    <div class="mt-6">
      <h2 class="text-xl font-bold">新增用户数</h2>
    </div>
    <DailyChart
      class="mt-4"
      :loading="dailyPending"
      :daily="daily"
      :field="{ key: 'new_users', name: '新增用户数', color: '#406df6' }"
    ></DailyChart>

    <div class="mt-6">
      <h2 class="text-xl font-bold">完整数据</h2>
    </div>
    <DailyTable class="mt-4" :loading="dailyPending" :daily="daily"></DailyTable>
  </div>
</template>
