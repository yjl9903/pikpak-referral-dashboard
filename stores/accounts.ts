import { defineStore, skipHydrate } from 'pinia';

import { PikPakClient } from '~/utils/pikpak';

export interface PikPakAccount {
  nickname: string;

  email: string;

  accessToken: string;

  refreshToken: string;

  deviceId: string;
}

function loadCache() {
  const cache = !import.meta.env.SSR
    ? JSON.parse(window.localStorage.getItem('pikpak_accounts') ?? 'null')
    : undefined;
  if (cache) {
    return cache.filter(Boolean).map((c: any) => new PikPakClient({ account: c.account, token: c }));
  } else {
    return [];
  }
}

export const usePikPakAccounts = defineStore('pikpakAccountsStore', () => {
  const cache = loadCache();

  const accounts = shallowRef<PikPakClient[]>(cache);

  const currentAccounts = shallowRef<PikPakClient[]>([...accounts.value]);

  !import.meta.env.SSR && watch(accounts, (accounts) => {
    window.localStorage.setItem('pikpak_accounts', JSON.stringify(accounts.map((a) => a.token)));
  });

  return {
    accounts: skipHydrate(accounts),
    currentAccounts: skipHydrate(currentAccounts),
    async login(account: string, password: string) {
      const client = new PikPakClient({
        account,
        password,
        host: { user: `${location.protocol}//${location.host}/api/` }
      });

      const resp = await client.login().catch(() => undefined);

      if (resp) {
        const isSelectAll = currentAccounts.value.length === accounts.value.length;
        accounts.value = [client, ...accounts.value];
        if (isSelectAll) {
          currentAccounts.value = [client, ...currentAccounts.value];
        }
      }
    }
  };
});
