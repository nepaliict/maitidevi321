import AdminLayout from '@/components/admin/AdminLayout';
import DashboardModule from '@/components/admin/modules/DashboardModule';
import UserManagementModule from '@/components/admin/modules/UserManagementModule';
import FinancialModule from '@/components/admin/modules/FinancialModule';
import KYCModule from '@/components/admin/modules/KYCModule';
import GamesModule from '@/components/admin/modules/GamesModule';
import BonusRulesModule from '@/components/admin/modules/BonusRulesModule';
import LogsModule from '@/components/admin/modules/LogsModule';
import SuperSettingsModule from '@/components/admin/modules/SuperSettingsModule';
import MessagesModule from '@/components/admin/modules/MessagesModule';
import TransactionAuditModule from '@/components/admin/modules/TransactionAuditModule';
import ActivityLogModule from '@/components/admin/modules/ActivityLogModule';
import AnalyticsModule from '@/components/admin/modules/AnalyticsModule';
import PlayerTransferModule from '@/components/admin/modules/PlayerTransferModule';
import SessionManagementModule from '@/components/admin/modules/SessionManagementModule';
import SettlementModule from '@/components/admin/modules/SettlementModule';
import ExposureTransferModule from '@/components/admin/modules/ExposureTransferModule';
import GameWalletModule from '@/components/admin/modules/GameWalletModule';
import { type UserRole } from '@/config/adminRoles';

interface AdminPageProps {
  role: UserRole;
}

export default function AdminPage({ role }: AdminPageProps) {
  return (
    <AdminLayout role={role}>
      {({ activeModule, setActiveModule }) => (
        <ModuleRenderer role={role} activeModule={activeModule} onNavigate={setActiveModule} />
      )}
    </AdminLayout>
  );
}

function ModuleRenderer({ role, activeModule, onNavigate }: { role: UserRole; activeModule: string; onNavigate: (id: string) => void }) {
  switch (activeModule) {
    case 'dashboard':
      return <DashboardModule role={role} onNavigate={onNavigate} />;
    case 'messages':
      return <MessagesModule />;
    case 'super-users':
      return <UserManagementModule role={role} targetRole="super" />;
    case 'master-users':
      return <UserManagementModule role={role} targetRole="master" />;
    case 'player-users':
      return <UserManagementModule role={role} targetRole="player" />;
    case 'kyc':
      return <KYCModule />;
    case 'deposits':
      return <FinancialModule role={role} type="deposits" />;
    case 'withdrawals':
      return <FinancialModule role={role} type="withdrawals" />;
    case 'game-categories':
      return <GamesModule role={role} type="game-categories" />;
    case 'game-providers':
      return <GamesModule role={role} type="game-providers" />;
    case 'games':
      return <GamesModule role={role} type="games" />;
    case 'bonus-rules':
      return <BonusRulesModule />;
    case 'game-logs':
      return <LogsModule type="game-logs" />;
    case 'transaction-audit':
      return <TransactionAuditModule role={role} />;
    case 'transactions':
      return <LogsModule type="transactions" />;
    case 'activity-logs':
      return <ActivityLogModule role={role} />;
    case 'analytics':
      return <AnalyticsModule role={role} />;
    case 'player-transfer':
      return <PlayerTransferModule />;
    case 'sessions':
      return <SessionManagementModule role={role} />;
    case 'settlement':
      return <SettlementModule role={role} />;
    case 'exposure-transfer':
      return <ExposureTransferModule />;
    case 'game-wallet':
      return <GameWalletModule />;
    case 'super-settings':
      return <SuperSettingsModule />;
    default:
      return <DashboardModule role={role} onNavigate={onNavigate} />;
  }
}
