import { defineStore, skipHydrate } from 'pinia';

import { PikPakClient } from '~/utils/pikpak';

export interface PikPakAccount {
  nickname: string;

  email: string;

  accessToken: string;

  refreshToken: string;

  deviceId: string;
}

function loadCache(): PikPakClient[] {
  const cache = !import.meta.env.SSR
    ? JSON.parse(window.localStorage.getItem('pikpak_accounts') ?? 'null')
    : undefined;
  if (cache) {
    return cache.filter(Boolean).map(
      (c: any) =>
        new PikPakClient({
          account: c.account,
          token: c,
          host: {
            api: `${location.protocol}//${location.host}/api/`,
            user: `${location.protocol}//${location.host}/api/`
          }
        })
    );
  } else {
    return [];
  }
}

function setCache(accounts: PikPakClient[]) {
  if (!import.meta.env.SSR) {
    window.localStorage.setItem('pikpak_accounts', JSON.stringify(accounts.map((a) => a.token).filter(Boolean)));
  }
}

export const usePikPakAccounts = defineStore('PikpakAccountsStore', () => {
  const init = loadCache();
  const accounts = shallowRef<PikPakClient[]>(init);
  const currentAccounts = shallowRef<PikPakClient[]>([...accounts.value]);

  init.forEach((client) => {
    client.options.onRefreshToken = () => {
      accounts.value = accounts.value.filter(ac => ac.token);
      setCache(accounts.value);
    };
  });

  !import.meta.env.SSR &&
    watch(accounts, (accounts) => {
      setCache(accounts);
    });

  return {
    accounts: skipHydrate(accounts),
    currentAccounts: skipHydrate(currentAccounts),
    async login(account: string, password: string) {
      const exist = accounts.value.find(ac => ac.account === account);
      if (exist) return exist;

      const client = new PikPakClient({
        account,
        password,
        host: {
          api: `${location.protocol}//${location.host}/api/`,
          user: `${location.protocol}//${location.host}/api/`
        }
      });

      const resp = await client.login();

      if (resp) {
        const isSelectAll = currentAccounts.value.length === accounts.value.length;
        accounts.value = [client, ...accounts.value];
        if (isSelectAll) {
          currentAccounts.value = [client, ...currentAccounts.value];
        }

        return client;
      }

      return undefined;
    }
  };
});
