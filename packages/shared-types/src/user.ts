export type UserTier = 'free' | 'premium' | 'pro' | 'admin';

export type UserRole = 'student_hs' | 'student_sv' | 'student_ielts' | 'lifelong' | 'researcher' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  tier: UserTier;
  role: UserRole | null;
  aiQuotaMonthly: number;
  aiQuotaUsed: number;
  aiQuotaRemaining: number;
  mindmapQuotaMonthly: number;
  emailVerified: boolean;
  createdAt: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface OnboardingDto {
  role: UserRole;
  subjects: string[]; // max 3 from MindmapSubject
}
