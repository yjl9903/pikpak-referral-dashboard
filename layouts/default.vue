<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

import LoginModal from '~/components/LoginModal';

const store = usePikPakAccounts();

const overlay = useOverlay();
const modal = overlay.create(LoginModal);

const menu = computed<NavigationMenuItem[][]>(() => {
  const isNoAccount = store.currentAccounts.length === 0;
  const isSelectAll = store.accounts.length === store.currentAccounts.length;

  return [
    [
      {
        label: 'PikPak 推广计划 Pro'
      }
    ],
    [
      {
        icon: 'i-lucide-plus',
        async onSelect() {
          const { result } = await modal.open();
          const data = await result;
          if (data) {
            await store.login(data.account, data.password);
          }
        }
      },
      {
        label: isNoAccount
          ? '无登录账号'
          : isSelectAll
            ? `所有账号`
            : `${store.currentAccounts[0].account}`,
        class: 'w-[120px] text-truncate',
        children: store.accounts.map((account) => {
          return {
            label: account.account,
            class: 'w-[144px] text-truncate'
          };
        })
      }
    ]
  ];
});

const ui = {
  viewportWrapper: 'absolute top-full left-[calc(100%-48px-120px)] flex w-[160px]'
};
</script>

<template>
  <div>
    <header>
      <ClientOnly>
        <UNavigationMenu
          :items="menu"
          :ui="ui"
          class="border-b border-default w-full px-12"
        ></UNavigationMenu>
      </ClientOnly>
    </header>
    <main class="px-12 pt-8">
      <slot />
    </main>
  </div>
</template>
