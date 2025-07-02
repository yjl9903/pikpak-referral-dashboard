<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

import LoginModal from '~/components/LoginModal.vue';

const store = usePikPakAccounts();

const overlay = useOverlay();
const modal = overlay.create(LoginModal);

const checkboxUI = {
  base: 'cursor-pointer rounded-sm ring ring-inset ring-accented overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2'
};

const menu = computed<NavigationMenuItem[][]>(() => {
  const isNoAccount = store.currentAccounts.length === 0;
  const isSelectAll = store.accounts.length === store.currentAccounts.length;

  return [
    [],
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
        class: 'w-[200px] max-sm:w-[120px]',
        slot: 'account'
      }
    ]
  ];
});

const selectOneAccount = (idx: number) => {
  store.selectOneAccount(idx);
};
</script>

<template>
  <div>
    <header class="fixed w-full bg-white z-100">
      <ClientOnly>
        <UNavigationMenu
          :items="menu"
          content-orientation="vertical"
          class="border-b border-default w-full px-24 max-sm:px-4"
        >
          <template #list-leading>
            <div class="flex items-center gap-2 select-none">
              <img src="/favicon.svg" alt="PikPak" class="w-5 h-5 max-sm:w-4 max-sm:h-4" />
              <span class="text-lg max-sm:text-base font-bold">PikPak 引荐计划 Pro</span>
              <span class="text-lg max-sm:hidden font-bold">收益看板</span>
            </div>
          </template>
          <template v-if="store.accounts.length > 1" #account-content>
            <div class="px-2 py-2">
              <div
                class="flex items-center px-2 py-1 select-none cursor-pointer rounded-md hover:bg-muted"
              >
                <UCheckbox
                  v-if="store.accounts.length > 1"
                  :ui="checkboxUI"
                  :modelValue="store.currentAccounts.length === store.accounts.length"
                  @update:model-value="store.selectAllAccounts()"
                >
                  <template #label>
                    <div class="w-[194px] truncate cursor-pointer">所有账号</div>
                  </template>
                </UCheckbox>
              </div>
              <div
                v-for="(account, idx) in store.accounts"
                :key="account.account"
                class="flex items-center px-2 py-1 select-none cursor-pointer rounded-md hover:bg-muted"
              >
                <UCheckbox
                  :ui="checkboxUI"
                  :modelValue="
                    store.isCurrentAccount[idx] &&
                    store.currentAccounts.length !== store.accounts.length
                  "
                  @update:model-value="selectOneAccount(idx)"
                >
                  <template #label>
                    <div class="w-[194px] truncate cursor-pointer">{{ account.account }}</div>
                  </template>
                </UCheckbox>
              </div>
            </div>
          </template>
        </UNavigationMenu>
      </ClientOnly>
    </header>

    <main class="px-24 max-sm:px-4 pt-20 pb-20">
      <slot />
    </main>
  </div>
</template>
