import { defineStore, skipHydrate } from 'pinia';

import { usePikPakAccounts } from './accounts';

interface ComissionsSummary {
  total: number;

  pending: number;

  available: number;
}

export const usePikPakComissionsSummary = defineStore('PikpakComissionsSummaryStore', () => {
  const { currentAccounts } = toRefs(usePikPakAccounts());

  const { data: summary, pending } = useAsyncData('pikpak_comissions_summary', async () => {
    const summary: ComissionsSummary = {
      total: 0,
      pending: 0,
      available: 0,
    };

    if (import.meta.env.SSR) return summary;

    const summarys = await Promise.all(
      currentAccounts.value.map((account) => account.getCommissionsSummary())
    );

    for (const item of summarys) {
      if (item.total) summary.total += item.total;
      if (item.pending) summary.pending += item.pending;
      if (item.available) summary.available += item.available;
    }

    return summary;
  });

  return {
    pending: skipHydrate(pending),
    summary: skipHydrate(summary)
  };
});
