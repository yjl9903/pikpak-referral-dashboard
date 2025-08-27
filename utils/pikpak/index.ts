import type {
  DailyCommissionStats,
  InvitedRewardSummary,
  PikPakUserInfo,
  Redemption,
  RevenueSummary
} from './types';

export * from './types';

const CLIENT_ID = 'YNxT9w7GMdWvEOKa';

const CLIENT_SECRET = 'dbw2OtmVEeuUvIptb1Coyg';

const USER_HOST = 'https://user.mypikpak.com';

const API_HOST = 'https://api-drive.mypikpak.com/';

export interface PikPakClientInit {
  account: string;

  password?: string;

  deviceId?: string;

  accessToken?: string;

  token?: PikPakToken;
}

export interface PikPakClientOptions {
  host?: {
    api?: string;

    user?: string;
  };

  onRefreshToken?: () => void;
}

export interface PikPakToken {
  sub: string;

  account: string;

  accessToken: string;

  refreshToken: string;

  deviceId: string;

  expires: number;
}

export interface PikPakFetchOptions {
  headers?: Record<string, string>;

  signal?: AbortSignal;
}

export class PikPakClient {
  public account: string;

  private readonly password: string | undefined;

  private readonly deviceId: string;

  public readonly options: PikPakClientOptions;

  public accessToken: string | undefined;

  public token: PikPakToken | undefined;

  private refreshTokenPromise: Promise<string> | undefined;

  public constructor(init: PikPakClientInit & PikPakClientOptions) {
    this.account = init.account;
    this.password = init.password;
    this.deviceId = init.token?.deviceId ?? init.deviceId ?? crypto.randomUUID();
    this.token = init.token;
    this.accessToken = init.accessToken || init.token?.accessToken;
    this.options = { host: init.host };
  }

  public static async create(accessToken: string, options?: PikPakClientOptions) {
    const client = new PikPakClient({
      account: '',
      accessToken,
      ...options
    });
    const info = await client.getUserInfo();
    client.account = info.email;
    return client;
  }

  private async request<T = any>(url: string | URL, init: RequestInit): Promise<T> {
    const resp = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Device-Id': this.deviceId,
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        ...(init.headers ?? {})
      }
    });

    if (resp.ok) {
      return await resp.json();
    } else if (resp.status === 401) {
      const data = await resp.json();
      if (typeof data?.message === 'string' && data.message.indexOf('token is expired') !== -1) {
        await this.refreshToken({ signal: init.signal ?? undefined });
        return this.request(url, init);
      }
    }

    throw new Error('请求失败', { cause: resp });
  }

  async login(options?: PikPakFetchOptions) {
    if (!this.password) throw new Error('没有密码');

    const url = new URL('v1/auth/signin', this.options.host?.user ?? USER_HOST);

    try {
      const captcha = await this.getCaptchaToken();

      const body = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'password',
        password: this.password,
        username: this.account,
        captcha_token: captcha.captcha_token
      };

      const resp: {
        token_type: 'Bearer';
        access_token: string;
        refresh_token: string;
        expires_in: number;
        sub: string;
      } = await this.request(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
      });

      this.token = {
        sub: resp.sub,
        account: this.account,
        accessToken: resp.access_token,
        refreshToken: resp.refresh_token,
        deviceId: this.deviceId,
        expires: Math.floor(new Date().getTime() / 1000) + resp.expires_in
      };

      return this.token;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(options?: PikPakFetchOptions) {
    if (!this.token) throw new Error('没有 Token');

    if (this.refreshTokenPromise) {
      return await this.refreshTokenPromise;
    }

    const token = this.token;

    this.refreshTokenPromise = new Promise(async (resolve, reject) => {
      const url = new URL('v1/auth/token', this.options.host?.user ?? USER_HOST);

      try {
        const body = {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken
        };

        const resp: {
          token_type: 'Bearer';
          access_token: string;
          refresh_token: string;
          expires_in: number;
          sub: string;
        } = await this.request(url, {
          ...options,
          method: 'POST',
          body: JSON.stringify(body)
        });

        this.token = {
          sub: resp.sub,
          account: this.account,
          accessToken: resp.access_token,
          refreshToken: resp.refresh_token,
          deviceId: this.deviceId,
          expires: Math.floor(new Date().getTime() / 1000) + resp.expires_in
        };
        this.accessToken = resp.access_token;
        this.refreshTokenPromise = undefined;

        try {
          this.options?.onRefreshToken?.();
        } catch {}

        resolve(resp.access_token);
      } catch (error) {
        this.token = undefined;
        this.accessToken = undefined;
        this.refreshTokenPromise = undefined;

        try {
          this.options?.onRefreshToken?.();
        } catch {}

        reject(error);
      }
    });

    return await this.refreshTokenPromise;
  }

  async getCaptchaToken(options?: PikPakFetchOptions) {
    const url = new URL('v1/shield/captcha/init', this.options.host?.user ?? USER_HOST);
    const body = {
      client_id: CLIENT_ID,
      device_id: this.deviceId,
      action: 'POST:https://user.mypikpak.com/v1/auth/signin',
      meta: {
        username: this.account
      }
    };

    try {
      const resp = await this.request(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
      });
      return resp as { captcha_token: string; expires_in: number };
    } catch (error) {
      throw error;
    }
  }

  async getUserInfo(options?: PikPakFetchOptions) {
    const url = new URL('v1/user/me', this.options.host?.user ?? USER_HOST);
    const resp = await this.request(url, { ...options });
    return resp as PikPakUserInfo;
  }

  async getCommissionsSummary(options?: PikPakFetchOptions) {
    const url = new URL('promoting/v1/commissions/summary', this.options.host?.api ?? API_HOST);
    const resp = await this.request(url, { ...options });
    return resp as RevenueSummary;
  }

  async getInvitedRewardSummary(options?: PikPakFetchOptions) {
    const url = new URL('promoting/v1/invited-reward/summary', this.options.host?.api ?? API_HOST);
    const resp = await this.request(url, { ...options });
    return resp as InvitedRewardSummary;
  }

  async getCommissionsDaily(
    options?: { from?: string; to?: string; user_id?: string } & PikPakFetchOptions
  ) {
    const params = new URLSearchParams();
    if (options?.from) {
      params.set('from', options.from);
    }
    if (options?.to) {
      params.set('to', options.to);
    }
    if (options?.user_id) {
      params.set('user_id', options.user_id);
    }

    const url = new URL(
      'promoting/v1/commissions/daily?' + params.toString(),
      this.options.host?.api ?? API_HOST
    );
    const resp = await this.request(url, { headers: options?.headers, signal: options?.signal });
    return resp.C0 as DailyCommissionStats[];
  }

  async getRedemptions(options?: PikPakFetchOptions) {
    const url = new URL('promoting/v1/redemptions', this.options.host?.api ?? API_HOST);
    const resp = await this.request(url, { ...options });
    return resp.redemptions as Redemption[];
  }
}
