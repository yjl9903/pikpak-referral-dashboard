/**
 * 子代理帳號資訊
 */
export interface SubAccount {
  /** 帳號 ID */
  user_id: string;
  /** 帳號暱稱 */
  nickname: string;
}

/**
 * 分成模式
 * - `C0`：CPS
 * - `C1`：CPA 或 CPS
 * - `C2`：CPA + CPS
 * （部分歷史資料可能出現 `CPA`／`CPS` 字面值，故一併納入）
 */
export type CommissionType = 'C0' | 'C1' | 'C2' | 'CPA' | 'CPS';

/**
 * 收益總覽 API 回傳結構
 */
export interface RevenueSummary {
  /** 總收益 (SGD) */
  total?: number;
  /** 不可提取收益 (SGD) */
  pending?: number;
  /** 可提取收益 (SGD) */
  available?: number;
  /** 使用者當前 IP 對應的國家代碼（ISO 3166-1 alpha-2） */
  country?: string;
  /** 當前登入帳號是否為子代理 */
  is_sub_account?: boolean;
  /** 主帳號登入時回傳的子代理清單 */
  sub_accounts?: SubAccount[];
  /** 分成模式 */
  commission_type?: CommissionType;
  /** T1-CPA 單價 */
  unit_price_1?: number;
  /** T2-CPA 單價 */
  unit_price_2?: number;
  /** 其他 CPA 單價 */
  unit_price_other?: number;
  /** CPS 分成比例 (0–1) */
  cps_ratio?: number;
  /**
   * 是否顯示「前往外部網站進行其他操作」按鈕
   * 僅當使用者開啟對應開關且設定了連結時為 `true`
   */
  display_custom_admin?: boolean;
}

export interface InvitedRewardSummary {
  total: number;
  totalPaidNums: number;
  totalRecommend: number;
  yesterday: number;
}

export interface DailyCommissionStats {
  /** 統計日期 (yyyy-MM-dd) */
  day: string;
  /** 新增用戶數 */
  new_users: number;
  /** 付費用戶數 */
  paid_users: number;
  /** 付費金額 (SGD) */
  paid_amount: number;
  /** 佣金金額 (SGD) */
  paid_amount_commission: number;
}

/**
 * 用户提供商信息
 */
export interface UserProvider {
  /** 提供商ID (如: google.com, telegram.com) */
  id: string;
  /** 提供商用户ID */
  provider_user_id: string;
  /** 在该提供商平台的用户名 */
  name: string;
}

/**
 * 用户状态
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * 密码状态
 */
export type PasswordStatus = 'SET' | 'UNSET';

/**
 * PikPak 用户信息
 */
export interface PikPakUserInfo {
  /** 用户唯一标识 */
  sub: string;
  /** 用户名 */
  name: string;
  /** 用户头像URL */
  picture: string;
  /** 用户邮箱 */
  email: string;
  /** 用户电话号码 */
  phone_number: string;
  /** 用户关联的第三方登录提供商 */
  providers: UserProvider[];
  /** 密码设置状态 */
  password: PasswordStatus;
  /** 用户状态 */
  status: UserStatus;
  /** 账户创建时间 */
  created_at: string;
  /** 密码最后更新时间 */
  password_updated_at: string;
}
