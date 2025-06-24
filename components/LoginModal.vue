<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';

import * as z from 'zod';

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

async function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('close', { account: event.data.account, password: event.data.password });
}
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', undefined) }" :title="`登录 PikPak 账号`">
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="账户" name="account">
          <UInput v-model="state.account" />
        </UFormField>

        <UFormField label="密码" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormField>

        <UButton type="submit">登录</UButton>
      </UForm>
    </template>
  </UModal>
</template>
