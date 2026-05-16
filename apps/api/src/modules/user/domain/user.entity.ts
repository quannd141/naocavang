/**
 * User entity — domain layer (no framework dependencies).
 *
 * Represents a learner using Não Cá Vàng. Tier determines AI quota
 * and access to Premium features (v0.2+).
 */

export type UserTier = 'free' | 'premium' | 'pro' | 'admin';

export interface UserProps {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  tier: UserTier;
  aiQuotaMonthly: number;
  aiQuotaUsed: number;
  mindmapQuotaMonthly: number;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get tier(): UserTier {
    return this.props.tier;
  }

  get aiQuotaRemaining(): number {
    return Math.max(0, this.props.aiQuotaMonthly - this.props.aiQuotaUsed);
  }

  get isEmailVerified(): boolean {
    return this.props.emailVerifiedAt !== null;
  }

  /**
   * Default quotas by tier (used at registration + monthly reset).
   */
  static defaultQuotaByTier(tier: UserTier): {
    aiQuotaMonthly: number;
    mindmapQuotaMonthly: number;
  } {
    switch (tier) {
      case 'free':
        return { aiQuotaMonthly: 50, mindmapQuotaMonthly: 10 };
      case 'premium':
        return { aiQuotaMonthly: 500, mindmapQuotaMonthly: 100 };
      case 'pro':
        return { aiQuotaMonthly: 5_000, mindmapQuotaMonthly: 1_000 };
      case 'admin':
        return { aiQuotaMonthly: 100_000, mindmapQuotaMonthly: 100_000 };
    }
  }
}
