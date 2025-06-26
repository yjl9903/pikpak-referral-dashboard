import { defineStore, skipHydrate } from 'pinia';

import type { DailyCommissionStats } from '~/utils/pikpak';

import { generatePredefinedFilterDates } from '~/utils/date';

import { usePikPakAccounts } from './accounts';

interface ComissionsSummary {
  total: number;

  pending: number;

  available: number;
}

export const usePikPakComissionsSummary = defineStore('PikpakComissionsSummaryStore', () => {
  const { accounts, currentAccounts } = toRefs(usePikPakAccounts());

  const {
    data: allSummarys,
    pending,
    refresh
  } = useAsyncData('pikpak_comissions_summary', async () => {
    if (import.meta.env.SSR) return undefined;

    const summarys = await Promise.all(
      accounts.value.map(async (account) => ({
        account,
        summary: await account.getCommissionsSummary()
      }))
    );

    return summarys;
  });

  watch(accounts, () => {
    refresh();
  });

  const summary = computed(() => {
    const summary: ComissionsSummary = {
      total: 0,
      pending: 0,
      available: 0
    };

    if (!allSummarys.value) return summary;

    const current = allSummarys.value.filter((item) =>
      currentAccounts.value.find((a) => a.account === item.account.account)
    );

    for (const item of current) {
      if (item.summary.total) summary.total += item.summary.total;
      if (item.summary.pending) summary.pending += item.summary.pending;
      if (item.summary.available) summary.available += item.summary.available;
    }

    return summary;
  });

  return {
    pending: skipHydrate(pending),
    summary: skipHydrate(summary),
    allSummarys: skipHydrate(allSummarys),
    refresh
  };
});

export const usePikPakComissionsDaily = defineStore('PikpakComissionsDailyStore', () => {
  const filters = generatePredefinedFilterDates();
  const range = ref<[string, string]>(filters.last30Days);

  const { accounts, currentAccounts } = toRefs(usePikPakAccounts());

  const {
    data: allDaily,
    pending,
    refresh
  } = useAsyncData('pikpak_comissions_daily', async () => {
    const daily = await Promise.all(
      accounts.value.map(async (account) => ({
        account,
        daily: await account.getCommissionsDaily({ from: range.value[0], to: range.value[1] })
      }))
    );

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
