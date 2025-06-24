import { defineStore, skipHydrate } from 'pinia';

import { PikPakClient } from '~/utils/pikpak';

export interface PikPakAccount {
  nickname: string;

  email: string;

  accessToken: string;

  refreshToken: string;

  deviceId: string;
}

export const usePikPakAccounts = defineStore('pikpakAccountsStore', () => {
  const cache = !import.meta.env.SSR
    ? JSON.parse(window.localStorage.getItem('pikpak_accounts') ?? 'null')
    : undefined;

  const accounts = shallowRef<PikPakClient[]>(
    cache ? cache.map((c: any) => new PikPakClient({ account: c.account, token: c })) : []
  );

  const currentAccounts = shallowRef<PikPakClient[]>([...accounts.value]);

  !import.meta.env.SSR && watch(accounts, (accounts) => {
    console.log('watch accounts', accounts);
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
      await client.login();

      const isSelectAll = currentAccounts.value.length === accounts.value.length;
      accounts.value = [client, ...accounts.value];
      if (isSelectAll) {
        currentAccounts.value = [client, ...currentAccounts.value];
      }
    }
  };
});
