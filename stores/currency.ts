import { defineStore, skipHydrate } from 'pinia';
import { type CurrencyCode, ExchangeRateClient, SUPPORTED_CURRENCIES } from '~/utils/exchange-rate';

interface CurrencyState {
  currentCurrency: CurrencyCode;
  exchangeRates: Record<string, number>;
  lastUpdated: number | null;
  loading: boolean;
  error: string | null;
}

export const useCurrencyStore = defineStore('CurrencyStore', () => {
  const exchangeRateClient = new ExchangeRateClient();

  // 状态
  const state = reactive<CurrencyState>({
    currentCurrency: 'CNY', // 默认显示 CNY
    exchangeRates: {},
    lastUpdated: null,
    loading: false,
    error: null
  });

  // 计算属性
  const currentCurrencyInfo = computed(() => SUPPORTED_CURRENCIES[state.currentCurrency]);

  const supportedCurrencies = computed(() =>
    Object.values(SUPPORTED_CURRENCIES).map((currency) => ({
      label: `${currency.name} (${currency.code})`,
      value: currency.code,
      symbol: currency.symbol
    }))
  );

  // 获取汇率数据
  const fetchExchangeRates = async () => {
    if (state.loading) return;

    state.loading = true;
    state.error = null;

    try {
      // 获取SGD为基准的汇率
      const rates = await exchangeRateClient.getExchangeRates('SGD');

      state.exchangeRates = {
        'SGD-SGD': 1, // SGD到SGD
        'SGD-CNY': rates.rates.CNY || 0,
        'SGD-USD': rates.rates.USD || 0,
        'SGD-EUR': rates.rates.EUR || 0
      };

      state.lastUpdated = Date.now();
    } catch (error) {
      state.error = error instanceof Error ? error.message : '获取汇率失败';
      console.error('获取汇率失败:', error);
    } finally {
      state.loading = false;
    }
  };

  // 设置当前货币
  const setCurrency = (currency: CurrencyCode) => {
    state.currentCurrency = currency;
  };

  // 转换金额
  const convertAmount = (
    amount: number,
    fromCurrency: CurrencyCode = 'SGD',
    toCurrency?: CurrencyCode
  ): number => {
    const targetCurrency = toCurrency || state.currentCurrency;

    if (fromCurrency === targetCurrency) {
      return amount;
    }

    // 如果是从SGD转换到其他货币
    if (fromCurrency === 'SGD') {
      const rate = state.exchangeRates[`SGD-${targetCurrency}`];
      return rate ? amount * rate : amount;
    }

    // 如果是从其他货币转换到SGD
    if (targetCurrency === 'SGD') {
      const rate = state.exchangeRates[`SGD-${fromCurrency}`];
      return rate ? amount / rate : amount;
    }

    // 其他货币间的转换需要通过SGD中转
    const fromRate = state.exchangeRates[`SGD-${fromCurrency}`];
    const toRate = state.exchangeRates[`SGD-${targetCurrency}`];

    if (fromRate && toRate) {
      const sgdAmount = amount / fromRate;
      return sgdAmount * toRate;
    }

    return amount;
  };

  // 格式化金额显示
  const formatAmount = (amount: number): string => {
    const targetCurrency = state.currentCurrency;
    const convertedAmount = convertAmount(amount, 'SGD', targetCurrency);
    return convertedAmount.toFixed(2);
  };

  // 获取汇率信息
  const getExchangeRate = (from: CurrencyCode = 'SGD', to?: CurrencyCode): number => {
    const targetCurrency = to || state.currentCurrency;
    return state.exchangeRates[`${from}-${targetCurrency}`] || 1;
  };

  // 检查是否需要更新汇率（超过1小时）
  const shouldUpdateRates = computed(() => {
    if (!state.lastUpdated) return true;
    return Date.now() - state.lastUpdated > 60 * 60 * 1000; // 1小时
  });

  // 自动获取汇率
  const init = async () => {
    if (shouldUpdateRates.value) {
      await fetchExchangeRates();
    }
  };

  return {
    // 状态
    exchangeRates: skipHydrate(toRef(state, 'exchangeRates')),
    lastUpdated: skipHydrate(toRef(state, 'lastUpdated')),
    loading: skipHydrate(toRef(state, 'loading')),
    error: skipHydrate(toRef(state, 'error')),

    // 计算属性
    currentCurrency: currentCurrencyInfo,
    supportedCurrencies,
    shouldUpdateRates: skipHydrate(shouldUpdateRates),

    // 方法
    init,
    fetchExchangeRates,
    setCurrency,
    convertAmount,
    formatAmount,
    getExchangeRate
  };
});
