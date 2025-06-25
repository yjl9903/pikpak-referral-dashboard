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
        label: 'PikPak 引荐计划 Pro'
      }
    ],
    [
      {
        icon: 'i-lucide-plus',
        onSelect() {
          modal.open();
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
            class: 'w-[224px] text-truncate'
          };
        })
      }
    ]
  ];
});

const ui = {
  // viewportWrapper: 'absolute top-full left-[calc(100%-48px-240px)] flex w-[240px]',
};
</script>

<template>
  <div>
    <header>
      <ClientOnly>
        <UNavigationMenu
          :items="menu"
          :ui="ui"
          content-orientation="vertical"
          class="border-b border-default w-full px-12"
        ></UNavigationMenu>
      </ClientOnly>
    </header>
    <main class="px-12 pt-8 pb-20">
      <slot />
    </main>
  </div>
</template>
