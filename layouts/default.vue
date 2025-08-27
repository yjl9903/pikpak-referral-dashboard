<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

import LoginModal from '~/components/LoginModal.vue';

const store = usePikPakAccounts();

const overlay = useOverlay();
const modal = overlay.create(LoginModal);

const checkboxUI = {
  base: 'cursor-pointer rounded-sm ring ring-inset ring-accented overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2'
};

// 连续点击相关状态
const clickCount = ref(0);
const lastClickTime = ref(0);
const CLICK_THRESHOLD = 5; // 需要连续点击5次
const CLICK_TIMEOUT = 200; // 200ms 内的点击才算连续

const copyShareURL = () => {
  const search = new URLSearchParams();
  store.accounts.forEach((client) => {
    if (client.accessToken) {
      search.append('access_token', client.accessToken);
    }
  });
  const url = `${location.origin}?${search.toString()}`;
  navigator.clipboard.writeText(url);
};

const handleTitleClick = () => {
  const now = Date.now();

  // 如果距离上次点击超过时间阈值，重置计数
  if (now - lastClickTime.value > CLICK_TIMEOUT) {
    clickCount.value = 1;
  } else {
    clickCount.value++;
  }

  lastClickTime.value = now;

  // 达到点击阈值时触发复制
  if (clickCount.value >= CLICK_THRESHOLD) {
    copyShareURL();
    clickCount.value = 0; // 重置计数

    // 显示提示信息
    const toast = useToast();
    toast.add({
      title: '链接已复制到剪贴板',
      description: '分享链接已成功复制',
      color: 'success'
    });
  }
};

const menu = computed<NavigationMenuItem[][]>(() => {
  const isNoAccount = store.currentAccounts.length === 0;
  const isSelectAll =
    store.accounts.length === store.currentAccounts.length && store.currentAccounts.length > 1;

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
    <header class="fixed w-screen bg-white z-100">
      <ClientOnly>
        <UNavigationMenu
          :items="menu"
          content-orientation="vertical"
          class="border-b border-default w-full px-24 max-sm:px-4"
        >
          <template #list-leading>
            <div
              class="flex items-center gap-2 select-none cursor-pointer"
              @click="handleTitleClick"
            >
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
