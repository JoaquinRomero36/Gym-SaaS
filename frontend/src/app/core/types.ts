/* ═══════════════════════════════════════════
   AI Gym Retention — Domain types
   Shared between services and components
   ═══════════════════════════════════════════ */

export type UserRole = 'admin' | 'coach' | 'member';
export type MemberStatus = 'active' | 'inactive' | 'churned';
export type MemberLevel = 'beginner' | 'intermediate' | 'advanced';
export type GymPlan = 'basic' | 'pro' | 'enterprise';
export type RiskCategory = 'low' | 'medium' | 'high';
export type NotificationChannel = 'whatsapp' | 'email' | 'in-app';
export type NotificationTrigger =
  | 'inactivity'
  | 'low_feedback'
  | 'high_risk'
  | 'milestone'
  | 'manual';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';

/* ── Auth ── */

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserInfo;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  gymId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  gym_id: string;
  name: string;
  email: string;
  password: string;
}

/* ── Domain entities ── */

export interface Gym {
  id: string;
  name: string;
  plan: GymPlan;
  createdAt: string;
}

export interface Coach {
  id: string;
  gym_id: string;
  name: string;
  email: string;
}

export interface Member {
  id: string;
  gym_id: string;
  coach_id: string | null;
  name: string;
  email: string;
  level: MemberLevel;
  joinedAt: string;
  status: MemberStatus;
}

export interface Exercise {
  id?: string;
  routine_id?: string;
  name: string;
  sets: number;
  reps: number;
  order: number;
}

export interface Routine {
  id: string;
  gym_id: string;
  coach_id: string;
  user_id: string | null;
  name: string;
  createdAt: string;
  exercises?: Exercise[];
}

export interface AttendanceLog {
  id: string;
  user_id: string;
  gym_id: string;
  date: string;
  completed: boolean;
}

export interface FeedbackEntry {
  id: string;
  user_id: string;
  gym_id: string;
  date: string;
  effortLevel: number;
  energyLevel: number;
  note?: string | null;
  createdAt?: string;
}

export interface FeedbackAverages {
  avgEffort: number;
  avgEnergy: number;
}

export interface RiskScore {
  id: string;
  user_id: string;
  gym_id: string;
  score: number;
  category: RiskCategory;
  calculatedAt: string;
  features?: Record<string, number>;
}

export interface Notification {
  id: string;
  user_id: string;
  gym_id: string;
  channel: NotificationChannel;
  message: string;
  trigger: NotificationTrigger;
  sentAt?: string;
  createdAt: string;
  status: NotificationStatus;
}

/* ── Aggregates ── */

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  churnedUsers: number;
  usersAtHighRisk: number;
  usersAtMediumRisk?: number;
  usersAtLowRisk: number;
  notificationsSentToday: number;
  todayAttendance: number;
  recentRisks?: RecentRisk[];
}

export interface RecentRisk {
  userId: string;
  userName: string;
  score: number;
  category: RiskCategory;
}

/* ── Helpers ── */

export function isMember(value: unknown): value is Member {
  return !!value && typeof value === 'object' && 'status' in (value as object);
}

export function riskCategoryFromScore(score: number | null | undefined): RiskCategory | null {
  if (score == null) return null;
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

export function roleLabel(role: UserRole | string | undefined): string {
  switch (role) {
    case 'admin':  return 'Administrador';
    case 'coach':  return 'Coach';
    case 'member': return 'Miembro';
    default:       return '';
  }
}
