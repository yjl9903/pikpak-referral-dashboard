const CLIENT_ID = 'YNxT9w7GMdWvEOKa';

const CLIENT_SECRET = 'dbw2OtmVEeuUvIptb1Coyg';

export interface PikPakClientInit {
  account: string;

  password?: string;

  deviceId?: string;

  token?: PikPakToken;

  host?: {
    api?: string;

    user?: string;
  };
}

export interface PikPakToken {
  account: string;

  accessToken: string;

  refreshToken: string;

  deviceId: string;
}

export class PikPakClient {
  public readonly account: string;

  private readonly password: string | undefined;

  private readonly deviceId: string;

  private readonly init: PikPakClientInit;

  public token: PikPakToken | undefined;

  public constructor(init: PikPakClientInit) {
    this.account = init.account;
    this.password = init.password;
    this.deviceId = init.token?.deviceId ?? init.deviceId ?? crypto.randomUUID();
    this.init = init;
  }

  private async request(url: string | URL, init: RequestInit) {
    const resp = await fetch(url, {
      ...init,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
        'Content-Type': 'application/json; charset=utf-8',
        ...(this.token ? { Authorization: `Bearer ${this.token.accessToken}` } : {}),
        ...init.headers
      }
    });

    if (resp.ok) {
      return await resp.json();
    } else {
      console.error(resp);
      throw new Error('请求失败', { cause: resp });
    }
  }

  async login() {
    if (!this.password) throw new Error('没有密码');

    const url = new URL('v1/auth/signin', this.init.host?.user ?? 'https://user.mypikpak.com');

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
        method: 'POST',
        body: JSON.stringify(body)
      });

      this.token = {
        account: this.account,
        accessToken: resp.access_token,
        refreshToken: resp.refresh_token,
        deviceId: this.deviceId
      };

      return this.token;
    } catch (error) {
      throw error;
    }
  }

  async getCaptchaToken() {
    const url = new URL(
      'v1/shield/captcha/init',
      this.init.host?.user ?? 'https://user.mypikpak.com'
    );
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
        method: 'POST',
        body: JSON.stringify(body)
      });
      return resp as { captcha_token: string; expires_in: number };
    } catch (error) {
      throw error;
    }
  }
}
