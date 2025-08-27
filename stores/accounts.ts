import { defineStore, skipHydrate } from 'pinia';

import { PikPakClient } from '~/utils/pikpak';

export interface PikPakAccount {
  nickname: string;

  email: string;

  accessToken: string;

  refreshToken: string;

  deviceId: string;
}

function getAPIHost() {
  return {
    api: `${location.protocol}//${location.host}/api/`,
    user: `${location.protocol}//${location.host}/api/`
  };
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
          host: getAPIHost()
        })
    );
  } else {
    return [];
  }
}

function setCache(accounts: PikPakClient[]) {
  if (!import.meta.env.SSR) {
    window.localStorage.setItem(
      'pikpak_accounts',
      JSON.stringify(accounts.map((a) => a.token).filter(Boolean))
    );
  }
}

export const usePikPakAccounts = defineStore('PikpakAccountsStore', () => {
  const init = loadCache();
  const accounts = shallowRef<PikPakClient[]>(init);
  const currentAccounts = shallowRef<PikPakClient[]>([...accounts.value]);

  const isCurrentAccount = ref<boolean[]>(
    accounts.value.map((ac) => currentAccounts.value.some((t) => t.account === ac.account))
  );

  if (!import.meta.env.SSR) {
    const search = new URLSearchParams(location.search);
    const accessToken = search.getAll('access_token');
    console.log(accessToken);
    Promise.all(accessToken.map((ac) => PikPakClient.create(ac, { host: getAPIHost() }))).then(
      (clients) => {
        accounts.value = [...clients, ...accounts.value];
        currentAccounts.value = [...clients, ...currentAccounts.value];
      }
    );

    // @ts-ignore
    window.$getShareURL = () => {
      const search = new URLSearchParams();
      accounts.value.forEach((client) => {
        if (client.accessToken) {
          search.append('access_token', client.accessToken);
        }
      });
      return `${location.origin}?${search.toString()}`;
    };
  }

  !import.meta.env.SSR &&
    watch(
      () => accounts.value,
      (newValue) => {
        setCache(accounts.value);

        newValue.forEach((client) => {
          client.options.onRefreshToken = () => {
            accounts.value = accounts.value.filter((ac) => ac.token);
          };
        });

        isCurrentAccount.value = newValue.map((ac) =>
          currentAccounts.value.some((t) => t.account === ac.account)
        );
      },
      {
        immediate: true
      }
    );

  return {
    accounts: skipHydrate(accounts),
    currentAccounts: skipHydrate(currentAccounts),
    isCurrentAccount: skipHydrate(isCurrentAccount),
    selectAllAccounts() {
      isCurrentAccount.value = accounts.value.map((ac) => true);
      currentAccounts.value = [...accounts.value];
    },
    selectOneAccount(idx: number) {
      for (let i = 0; i < isCurrentAccount.value.length; i++) {
        isCurrentAccount.value[i] = false;
      }
      isCurrentAccount.value[idx] = true;
      currentAccounts.value = accounts.value.filter((_, index) => isCurrentAccount.value[index]);
    },
    async login(account: string, password: string) {
      const exist = accounts.value.find((ac) => ac.account === account);
      if (exist) return exist;

      const client = new PikPakClient({
        account,
        password,
        host: getAPIHost()
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
