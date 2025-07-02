// ExchangeRate-API 基础配置
const EXCHANGE_API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

// 支持的货币类型
export const SUPPORTED_CURRENCIES = {
  SGD: { code: 'SGD', name: '新加坡元', symbol: 'S$' },
  CNY: { code: 'CNY', name: '人民币', symbol: '¥' },
  USD: { code: 'USD', name: '美元', symbol: '$' },
  EUR: { code: 'EUR', name: '欧元', symbol: '€' }
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface ExchangeRateService {
  getExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number>;
  getExchangeRates(base: CurrencyCode): Promise<ExchangeRateResponse>;
}

/**
 * 汇率服务类
 */
export class ExchangeRateClient implements ExchangeRateService {
  private readonly cache = new Map<string, { rate: number; timestamp: number }>();

  private readonly cacheTimeout = 60 * 60 * 1000; // 1小时缓存

  /**
   * 获取指定货币对的汇率
   */
  async getExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
    if (from === to) return 1;

    const cacheKey = `${from}-${to}`;
    const cached = this.cache.get(cacheKey);

    // 检查缓存是否有效
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.rate;
    }

    try {
      const rates = await this.getExchangeRates(from);
      const rate = rates.rates[to];

      if (!rate) {
        throw new Error(`汇率不可用: ${from} -> ${to}`);
      }

      // 缓存汇率
      this.cache.set(cacheKey, { rate, timestamp: Date.now() });

      return rate;
    } catch (error) {
      console.error('获取汇率失败:', error);
      // 如果有缓存数据，即使过期也返回
      if (cached) {
        return cached.rate;
      }
      throw error;
    }
  }

  /**
   * 获取基于某个货币的所有汇率
   */
  async getExchangeRates(base: CurrencyCode): Promise<ExchangeRateResponse> {
    const url = `${EXCHANGE_API_BASE_URL}/${base}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();
      return data;
    } catch (error) {
      console.error('请求汇率API失败:', error);
      throw new Error('无法获取汇率数据');
    }
  }

  /**
   * 货币转换
   */
  async convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return amount * rate;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}
