import { defineStore, skipHydrate } from 'pinia';

import type { DailyCommissionStats, PikPakClient } from '~/utils/pikpak';

import { generatePredefinedFilterDates } from '~/utils/date';

import { usePikPakAccounts } from './accounts';

interface ReferralSummary {
  total: number;

  pending: number;

  available: number;

  totalPaidNums: number;

  totalRecommend: number;
}

export const usePikPakComissionsSummary = defineStore('PikpakComissionsSummaryStore', () => {
  const { accounts, currentAccounts } = storeToRefs(usePikPakAccounts());

  const {
    data: allSummarys,
    pending,
    refresh
  } = useAsyncData('pikpak_comissions_summary', async () => {
    if (import.meta.env.SSR) return undefined;

    const summarys = await Promise.all(
      accounts.value.map(async (account) => {
        const [info, invited, summary] = await Promise.all([
          account.getUserInfo(),
          account.getInvitedRewardSummary(),
          account.getCommissionsSummary()
        ]);

        return {
          account,
          info,
          invited,
          summary
        };
      })
    );

    return summarys;
  });

  watch(accounts, () => {
    refresh();
  });

  const summary = computed(() => {
    const summary: ReferralSummary = {
      total: 0,
      pending: 0,
      available: 0,
      totalPaidNums: 0,
      totalRecommend: 0
    };

    if (!allSummarys.value) return summary;

    const current = allSummarys.value.filter((item) =>
      currentAccounts.value.find((a) => a.account === item.account.account)
    );

    for (const item of current) {
      if (item.summary.total) summary.total += item.summary.total;
      if (item.summary.pending) summary.pending += item.summary.pending;
      if (item.summary.available) summary.available += item.summary.available;
      if (item.invited.totalPaidNums) summary.totalPaidNums += item.invited.totalPaidNums;
      if (item.invited.totalRecommend) summary.totalRecommend += item.invited.totalRecommend;
    }

    return summary;
  });

  const allLastMonths = ref<Array<{ account: PikPakClient; daily: DailyCommissionStats[] }>>();

  const lastMonth = computed(() => {
    if (!allLastMonths.value) return undefined;
    if (currentAccounts.value.length !== 1) return undefined;

    const found = allLastMonths.value.find((item) =>
      currentAccounts.value.find((a) => a.account === item.account.account)
    );
    if (!found) return undefined;

    // 计算从哪一天开始的总收益 + 当前可提现收益 >= 100 SGD
    const targetAmount = 100; // 目标金额 100 SGD
    const currentAvailable = summary.value.available; // 当前可提现收益

    // 需要从历史数据中累积的金额
    const neededFromHistory = targetAmount - currentAvailable;

    // 从最新的数据开始往前累积，找到达到目标金额的日期
    let accumulatedAmount = 0;
    let targetReachedDay: Date | null = null;
    for (const item of [...found.daily].sort((a, b) => a.day.localeCompare(b.day))) {
      accumulatedAmount += item.paid_amount_commission || 0;
      if (accumulatedAmount >= neededFromHistory) {
        const targetDate = new Date(item.day);
        targetDate.setDate(targetDate.getDate() + 31);
        targetReachedDay = targetDate;
        break;
      }
    }

    return {
      daily: found.daily,
      reached: currentAvailable >= targetAmount,
      targetReachedDay
    };
  });

  return {
    pending: skipHydrate(pending),
    summary: skipHydrate(summary),
    lastMonth: skipHydrate(lastMonth),
    allSummarys: skipHydrate(allSummarys),
    allLastMonths: skipHydrate(allLastMonths),
    refresh
  };
});

export const usePikPakComissionsDaily = defineStore('PikpakComissionsDailyStore', () => {
  const filters = generatePredefinedFilterDates();
  const range = ref<[string, string]>(filters.last30Days);

  const { accounts, currentAccounts } = storeToRefs(usePikPakAccounts());
  const { allLastMonths } = storeToRefs(usePikPakComissionsSummary());

  const {
    data: allDaily,
    pending,
    refresh
  } = useAsyncData('pikpak_comissions_daily', async () => {
    const from = range.value[0];
    const to = range.value[1];

    const daily = await Promise.all(
      accounts.value.map(async (account) => ({
        account,
        daily: await account.getCommissionsDaily({ from, to })
      }))
    );

    if (filters.last30Days[0] === from && filters.last30Days[1] === to) {
      allLastMonths.value = [...daily];
    }

    return daily;
  });

  watch(range, () => {
    refresh();
  });
  watch(accounts, () => {
    refresh();
  });

  const daily = computed(() => {
    const data =
      allDaily.value
        ?.filter((item) => currentAccounts.value.find((a) => a.account === item.account.account))
        .map((item) => item.daily) ?? [];

    const merged = mergeDailyCommissionStats(...data);
    return merged;
  });

  const dailySummary = computed(() => {
    const summary = {
      paid_users: 0,
      new_users: 0,
      paid_amount: 0,
      paid_amount_commission: 0
    };

    if (!allDaily.value) return summary;

    for (const item of daily.value) {
      summary.new_users += item.new_users;
      summary.paid_users += item.paid_users;
      summary.paid_amount += item.paid_amount;
      summary.paid_amount_commission += item.paid_amount_commission;
    }

    return summary;
  });

  return {
    filters,
    range,
    pending: skipHydrate(pending),
    allDaily: skipHydrate(allDaily),
    daily: skipHydrate(daily),
    dailySummary: skipHydrate(dailySummary),
    refresh
  };
});

function mergeDailyCommissionStats(
  ...groups: readonly DailyCommissionStats[][]
): DailyCommissionStats[] {
  if (groups.length <= 1) return [...(groups[0] ?? [])].sort((a, b) => a.day.localeCompare(b.day));

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

  return [...acc.values()].sort((a, b) => a.day.localeCompare(b.day));
}
