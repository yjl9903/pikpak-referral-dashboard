<script setup lang="ts">
import { useCurrencyStore } from '~/stores/currency';

const currencyStore = useCurrencyStore();
const { currentCurrency, supportedCurrencies, loading, error, lastUpdated } =
  storeToRefs(currencyStore);

// 初始化汇率数据
onMounted(() => {
  currencyStore.init();
});

// 处理货币选择
const handleCurrencyChange = (currency: string) => {
  currencyStore.setCurrency(currency as any);
};

// 刷新汇率
const refreshRates = () => {
  currencyStore.fetchExchangeRates();
};

// 格式化最后更新时间
const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) return '';
  return new Date(lastUpdated.value).toLocaleString('zh-CN');
});
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground">显示币种:</span>
      <!-- <USelect
        :model-value="currentCurrency"
        :options="supportedCurrencies"
        :loading="loading"
        class="w-44"
        @update:model-value="handleCurrencyChange"
      >
        <template #option="{ option }">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ option.symbol }}</span>
            <span>{{ option.label }}</span>
          </div>
        </template>
        <template #selected="{ option }">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ option.symbol }}</span>
            <span>{{ option.label }}</span>
          </div>
        </template>
      </USelect> -->
    </div>

    <div class="flex items-center gap-2">
      <UButton
        variant="ghost"
        size="sm"
        :loading="loading"
        :disabled="loading"
        @click="refreshRates"
      >
        <Icon name="i-heroicons-arrow-path" class="w-4 h-4" />
        刷新汇率
      </UButton>
    </div>

    <div v-if="lastUpdated" class="text-xs text-muted-foreground">
      更新时间: {{ formattedLastUpdated }}
    </div>

    <div v-if="error" class="text-xs text-red-500">
      {{ error }}
    </div>
  </div>
</template>
