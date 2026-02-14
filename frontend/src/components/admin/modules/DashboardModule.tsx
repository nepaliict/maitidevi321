import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Gamepad2,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Activity,
  Clock,
  RefreshCw,
  FileCheck,
  Receipt,
} from 'lucide-react';
import { type UserRole, ROLE_CONFIG } from '@/config/adminRoles';

interface DashboardModuleProps {
  role: UserRole;
  onNavigate: (moduleId: string) => void;
}

export default function DashboardModule({ role, onNavigate }: DashboardModuleProps) {
  const [refreshing, setRefreshing] = useState(false);
  const roleConfig = ROLE_CONFIG[role];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className={`rounded-xl p-6 bg-gradient-to-r ${roleConfig.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white">
            Welcome, {roleConfig.label}
          </h2>
          <p className="text-white/80 mt-1">
            Here's your platform overview for today
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Key Metrics</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value="—"
          subtitle="Loading..."
          icon={Users}
          trend="+12%"
          trendUp
        />
        <StatsCard
          title="Pending Deposits"
          value="—"
          subtitle="Loading..."
          icon={ArrowDownToLine}
          trend="Action needed"
          trendUp={false}
        />
        <StatsCard
          title="Pending Withdrawals"
          value="—"
          subtitle="Loading..."
          icon={ArrowUpFromLine}
          trend="Action needed"
          trendUp={false}
        />
        {role === 'powerhouse' || role === 'super' ? (
          <StatsCard
            title="Active Games"
            value="—"
            subtitle="Loading..."
            icon={Gamepad2}
            trend="Live"
            trendUp
          />
        ) : (
          <StatsCard
            title="Today's P&L"
            value="₹0"
            subtitle="Net earnings"
            icon={TrendingUp}
            trend="Neutral"
            trendUp
          />
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MiniStat label="Pending KYC" value="—" icon={FileCheck} />
        <MiniStat label="Active Sessions" value="—" icon={Activity} />
        <MiniStat label="Open Tickets" value="—" icon={Clock} />
        <MiniStat label="Transactions" value="—" icon={Receipt} />
        {(role === 'powerhouse' || role === 'super') && (
          <>
            <MiniStat label="Masters" value="—" icon={Users} />
            <MiniStat label="Total Volume" value="—" icon={TrendingUp} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {role !== 'player' && (
              <>
                <QuickAction
                  label="Manage Users"
                  icon={Users}
                  onClick={() => onNavigate('player-users')}
                />
                <QuickAction
                  label="Review KYC"
                  icon={FileCheck}
                  onClick={() => onNavigate('kyc')}
                />
                <QuickAction
                  label="Deposits"
                  icon={ArrowDownToLine}
                  onClick={() => onNavigate('deposits')}
                />
                <QuickAction
                  label="Withdrawals"
                  icon={ArrowUpFromLine}
                  onClick={() => onNavigate('withdrawals')}
                />
              </>
            )}
            {role === 'powerhouse' && (
              <>
                <QuickAction
                  label="Games"
                  icon={Gamepad2}
                  onClick={() => onNavigate('games')}
                />
                <QuickAction
                  label="Transactions"
                  icon={Receipt}
                  onClick={() => onNavigate('transactions')}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <Badge
            variant="outline"
            className={
              trendUp
                ? 'bg-neon-green/10 text-neon-green border-neon-green/30'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }
          >
            {trend}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="glass rounded-lg p-3 text-center">
      <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickAction({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: any;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-auto py-4 flex-col gap-2 hover:border-primary/50"
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}
