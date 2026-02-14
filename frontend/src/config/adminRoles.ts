import { type LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileCheck,
  ArrowDownToLine,
  ArrowUpFromLine,
  Gamepad2,
  Layers,
  Server,
  Gift,
  ScrollText,
  Receipt,
  Activity,
  Settings,
} from 'lucide-react';

export type UserRole = 'powerhouse' | 'super' | 'master' | 'player';

export interface AdminModule {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

// All available admin modules
const ALL_MODULES: AdminModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & analytics' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Chat & communications' },
  { id: 'super-users', label: 'Super Users', icon: Users, description: 'Manage super admin users' },
  { id: 'master-users', label: 'Master Users', icon: Users, description: 'Manage master users' },
  { id: 'player-users', label: 'Player Users', icon: Users, description: 'Manage players' },
  { id: 'kyc', label: 'KYC', icon: FileCheck, description: 'KYC verification & actions' },
  { id: 'deposits', label: 'Deposits', icon: ArrowDownToLine, description: 'Manage deposits' },
  { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine, description: 'Manage withdrawals' },
  { id: 'game-categories', label: 'Game Categories', icon: Layers, description: 'Manage game categories' },
  { id: 'game-providers', label: 'Game Providers', icon: Server, description: 'Manage game providers' },
  { id: 'games', label: 'Games', icon: Gamepad2, description: 'Manage games' },
  { id: 'bonus-rules', label: 'Bonus Rules', icon: Gift, description: 'Manage bonus rules' },
  { id: 'game-logs', label: 'Game Logs', icon: ScrollText, description: 'View game activity' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, description: 'View transaction logs' },
  { id: 'activity-logs', label: 'Activity Logs', icon: Activity, description: 'View user activity' },
  { id: 'super-settings', label: 'Super Settings', icon: Settings, description: 'System configuration' },
];

// Role-based module access
const ROLE_MODULES: Record<UserRole, string[]> = {
  powerhouse: [
    'dashboard', 'messages', 'super-users', 'master-users', 'player-users',
    'kyc', 'deposits', 'withdrawals', 'game-categories', 'game-providers',
    'games', 'bonus-rules', 'game-logs', 'transactions', 'activity-logs', 'super-settings',
  ],
  super: [
    'dashboard', 'messages', 'master-users', 'player-users',
    'kyc', 'deposits', 'withdrawals',
    'game-logs', 'transactions', 'activity-logs',
  ],
  master: [
    'dashboard', 'messages', 'player-users',
    'kyc', 'deposits', 'withdrawals',
    'game-logs', 'transactions', 'activity-logs',
  ],
  player: [
    'dashboard', 'messages',
  ],
};

// Role display configuration
export const ROLE_CONFIG: Record<UserRole, {
  label: string;
  slug: string;
  color: string;
  gradient: string;
  badge: string;
}> = {
  powerhouse: {
    label: 'Powerhouse',
    slug: '/powerhouse',
    color: 'text-neon-gold',
    gradient: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-500/20 text-amber-400',
  },
  super: {
    label: 'Super Admin',
    slug: '/superadmin',
    color: 'text-neon-purple',
    gradient: 'from-purple-500 to-violet-600',
    badge: 'bg-purple-500/20 text-purple-400',
  },
  master: {
    label: 'Master',
    slug: '/master',
    color: 'text-primary',
    gradient: 'from-cyan-500 to-blue-600',
    badge: 'bg-cyan-500/20 text-cyan-400',
  },
  player: {
    label: 'Player',
    slug: '/user',
    color: 'text-neon-green',
    gradient: 'from-green-500 to-emerald-600',
    badge: 'bg-green-500/20 text-green-400',
  },
};

export function getModulesForRole(role: UserRole): AdminModule[] {
  const moduleIds = ROLE_MODULES[role] || [];
  return ALL_MODULES.filter((m) => moduleIds.includes(m.id));
}

export function getRoleFromSlug(slug: string): UserRole | null {
  for (const [role, config] of Object.entries(ROLE_CONFIG)) {
    if (config.slug === slug || config.slug === `/${slug}`) {
      return role as UserRole;
    }
  }
  return null;
}

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  powerhouse: 4,
  super: 3,
  master: 2,
  player: 1,
};

export function canAccessRole(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
}
