<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';

import * as z from 'zod';

const store = usePikPakAccounts();

const toast = useToast();

const emit = defineEmits<{ submitted: [] }>();

const schema = z.object({
  account: z.string({ message: '请输入账户' }).min(1, '请输入账户'),
  password: z.string({ message: '请输入密码' }).min(6, '密码至少 6 位')
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  account: undefined,
  password: undefined
});

const isSumiting = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { account, password } = event.data;
  try {
    isSumiting.value = true;
    const resp = await store.login(account, password);
    if (resp) {
      toast.add({
        title: '登录成功',
        color: 'success'
      });
      emit('submitted');
    } else {
      toast.add({
        title: '登录失败',
        color: 'error'
      });
    }
  } catch (error) {
    toast.add({
      title: '登录失败',
      color: 'error'
    });
  } finally {
    isSumiting.value = false;
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="账户" name="account" :ui="{ label: 'block font-bold text-default' }">
      <UInput v-model="state.account" :ui="{ root: 'w-full' }" />
    </UFormField>

    <UFormField label="密码" name="password" :ui="{ label: 'block font-bold text-default' }">
      <UInput v-model="state.password" type="password" :ui="{ root: 'w-full' }" />
    </UFormField>

    <UButton type="submit" color="success" :loading="isSumiting">登录</UButton>

    <div class="text-xs text-gray-500 p-3 bg-gray-50 rounded-md">
      <div class="flex items-start space-x-2">
        <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-green-500 flex-shrink-0" />
        <div>
          <p class="font-medium text-gray-700 mb-1">数据安全提醒</p>
          <p class="text-gray-600 leading-relaxed">
            您的登录信息将经过本站的<span class="font-bold">代理服务器</span>, 我们<span
              class="font-bold"
              >承诺不收集您的任何敏感信息</span
            >, 请妥善保管您的登录信息.
          </p>
        </div>
      </div>
    </div>
  </UForm>
</template>
