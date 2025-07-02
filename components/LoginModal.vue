<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';

import * as z from 'zod';

const store = usePikPakAccounts();

const toast = useToast();

const emit = defineEmits<{ close: [{ account: string; password: string } | undefined] }>();

const schema = z.object({
  account: z.string(),
  password: z.string().min(6, 'Must be at least 6 characters')
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
      emit('close', undefined);
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
  <UModal :close="{ onClick: () => emit('close', undefined) }" :title="`登录 PikPak 账号`">
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="账户" name="account" :ui="{ label: 'block font-bold text-default' }">
          <UInput v-model="state.account" :ui="{ root: 'w-full' }" />
        </UFormField>

        <UFormField label="密码" name="password" :ui="{ label: 'block font-bold text-default' }">
          <UInput v-model="state.password" type="password" :ui="{ root: 'w-full' }" />
        </UFormField>

        <UButton type="submit" color="success" :loading="isSumiting">登录</UButton>
      </UForm>
    </template>
  </UModal>
</template>
