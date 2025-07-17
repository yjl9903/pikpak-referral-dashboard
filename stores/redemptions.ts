import { defineStore, skipHydrate } from 'pinia';

import type { Redemption } from '~/utils/pikpak';

import { usePikPakAccounts } from './accounts';

export const usePikPakRedemptions = defineStore('PikpakRedemptionsStore', () => {
  const { accounts, currentAccounts } = storeToRefs(usePikPakAccounts());

  const {
    data: allRedemptions,
    pending,
    refresh,
    error
  } = useAsyncData('pikpak_redemptions', async () => {
    if (import.meta.env.SSR) return undefined;

    const redemptions = await Promise.all(
      accounts.value.map(async (account) => {
        try {
          const redemptionData = await account.getRedemptions();
          return {
            account,
            redemptions: redemptionData
          };
        } catch (err) {
          console.error(`获取账户 ${account.account} 的提现记录失败:`, err);
          return {
            account,
            redemptions: []
          };
        }
      })
    );

    return redemptions;
  });

  // 监听账户变化，自动刷新数据
  watch(accounts, () => {
    refresh();
  });

  // 当前选中账户的提现记录
  const currentRedemptions = computed(() => {
    if (!allRedemptions.value) return [];

    const current = allRedemptions.value.filter((item) =>
      currentAccounts.value.find((a) => a.account === item.account.account)
    );

    // 合并所有当前账户的提现记录
    const merged: Redemption[] = [];
    for (const item of current) {
      merged.push(...item.redemptions);
    }

    // 按时间正序排列
    return merged.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  });

  // 提现记录统计
  const redemptionStats = computed(() => {
    const stats = {
      total: 0, // 总提现次数
      totalAmount: 0, // 总提现金额
      pendingCount: 0, // 进行中的提现次数
      pendingAmount: 0, // 进行中的提现金额
      successCount: 0, // 成功提现次数
      successAmount: 0, // 成功提现金额
      errorCount: 0, // 失败提现次数
      errorAmount: 0 // 失败提现金额
    };

    for (const redemption of currentRedemptions.value) {
      stats.total++;
      stats.totalAmount += redemption.amount;

      switch (redemption.status) {
        case 'PENDING':
          stats.pendingCount++;
          stats.pendingAmount += redemption.amount;
          break;
        case 'SUCCEED':
          stats.successCount++;
          stats.successAmount += redemption.amount;
          break;
        case 'ERROR':
          stats.errorCount++;
          stats.errorAmount += redemption.amount;
          break;
      }
    }

    return stats;
  });

  // 按状态筛选的提现记录
  const redemptionsByStatus = computed(() => {
    return {
      pending: currentRedemptions.value.filter((r) => r.status === 'PENDING'),
      success: currentRedemptions.value.filter((r) => r.status === 'SUCCEED'),
      error: currentRedemptions.value.filter((r) => r.status === 'ERROR')
    };
  });

  // 按收款方式分组的提现记录
  const redemptionsByMethod = computed(() => {
    const grouped = new Map<string, Redemption[]>();

    for (const redemption of currentRedemptions.value) {
      if (!grouped.has(redemption.method)) {
        grouped.set(redemption.method, []);
      }
      grouped.get(redemption.method)!.push(redemption);
    }

    return Object.fromEntries(grouped);
  });

  return {
    // 数据状态
    pending: skipHydrate(pending),
    error: skipHydrate(error),
    allRedemptions: skipHydrate(allRedemptions),

    // 计算属性
    currentRedemptions: skipHydrate(currentRedemptions),
    redemptionStats: skipHydrate(redemptionStats),
    redemptionsByStatus: skipHydrate(redemptionsByStatus),
    redemptionsByMethod: skipHydrate(redemptionsByMethod),

    // 操作方法
    refresh
  };
});
