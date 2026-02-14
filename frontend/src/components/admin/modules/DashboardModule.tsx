import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Gamepad2,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  RefreshCw,
  FileCheck,
  Receipt,
  Wallet,
  Shield,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Zap,
  Eye,
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
      {/* Welcome Banner with Balance Overview */}
      <div className={`rounded-xl p-6 bg-gradient-to-r ${roleConfig.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/70 uppercase tracking-wider font-medium">{roleConfig.label} Panel</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {roleConfig.label}
            </h2>
            <p className="text-white/70 mt-1 text-sm">
              Here's your platform overview for today
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BalancePill label="Main Balance" value="₹0" />
            <BalancePill label="P&L Balance" value="₹0" />
            {role !== 'player' && <BalancePill label="Exposure" value="₹0" />}
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Key Metrics
        </h3>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value="—"
          subtitle="Across all roles"
          icon={Users}
          trend="+12%"
          trendUp
          accentClass="bg-primary/10 text-primary"
        />
        <StatsCard
          title="Pending Deposits"
          value="—"
          subtitle="Awaiting approval"
          icon={ArrowDownToLine}
          trend="Action needed"
          trendUp={false}
          accentClass="bg-accent/10 text-accent"
        />
        <StatsCard
          title="Pending Withdrawals"
          value="—"
          subtitle="Awaiting approval"
          icon={ArrowUpFromLine}
          trend="Action needed"
          trendUp={false}
          accentClass="bg-neon-purple/10 text-neon-purple"
        />
        {role === 'powerhouse' || role === 'super' ? (
          <StatsCard
            title="Active Games"
            value="—"
            subtitle="Currently live"
            icon={Gamepad2}
            trend="Live"
            trendUp
            accentClass="bg-neon-green/10 text-neon-green"
          />
        ) : (
          <StatsCard
            title="Today's P&L"
            value="₹0"
            subtitle="Net earnings"
            icon={TrendingUp}
            trend="Neutral"
            trendUp
            accentClass="bg-neon-green/10 text-neon-green"
          />
        )}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MiniStat label="Pending KYC" value="—" icon={FileCheck} color="text-accent" />
        <MiniStat label="Active Sessions" value="—" icon={Activity} color="text-neon-green" />
        <MiniStat label="Open Tickets" value="—" icon={Clock} color="text-neon-purple" />
        <MiniStat label="Transactions" value="—" icon={Receipt} color="text-primary" />
        {(role === 'powerhouse' || role === 'super') && (
          <>
            <MiniStat label="Masters" value="—" icon={Users} color="text-neon-gold" />
            <MiniStat label="Total Volume" value="—" icon={TrendingUp} color="text-neon-cyan" />
          </>
        )}
      </div>

      {/* Balance Breakdown Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Balance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <BalanceCard label="Main Balance" value="₹0" icon={DollarSign} color="text-neon-green" bgColor="bg-neon-green/10" percentage={0} />
            <BalanceCard label="P&L Balance" value="₹0" icon={TrendingUp} color="text-primary" bgColor="bg-primary/10" percentage={0} />
            <BalanceCard label="Bonus Balance" value="₹0" icon={Zap} color="text-accent" bgColor="bg-accent/10" percentage={0} />
            <BalanceCard label="Exposure Balance" value="₹0" icon={AlertTriangle} color="text-neon-purple" bgColor="bg-neon-purple/10" percentage={0} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {role !== 'player' && (
              <>
                <QuickAction label="Manage Users" icon={Users} onClick={() => onNavigate('player-users')} />
                <QuickAction label="Review KYC" icon={FileCheck} onClick={() => onNavigate('kyc')} />
                <QuickAction label="Deposits" icon={ArrowDownToLine} onClick={() => onNavigate('deposits')} />
                <QuickAction label="Withdrawals" icon={ArrowUpFromLine} onClick={() => onNavigate('withdrawals')} />
              </>
            )}
            {(role === 'powerhouse' || role === 'super') && (
              <>
                <QuickAction label="Transactions" icon={Receipt} onClick={() => onNavigate('transactions')} />
                <QuickAction label="Activity Logs" icon={Activity} onClick={() => onNavigate('activity-logs')} />
              </>
            )}
            {role === 'powerhouse' && (
              <>
                <QuickAction label="Games" icon={Gamepad2} onClick={() => onNavigate('games')} />
                <QuickAction label="Settings" icon={Eye} onClick={() => onNavigate('super-settings')} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      {role !== 'player' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Deposits</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => onNavigate('deposits')}>
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ArrowDownToLine className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No recent deposits</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Withdrawals</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => onNavigate('withdrawals')}>
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ArrowUpFromLine className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No recent withdrawals</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function BalancePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-strong rounded-lg px-4 py-2 min-w-[120px]">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-lg font-bold font-mono text-white">{value}</p>
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
  accentClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend: string;
  trendUp: boolean;
  accentClass: string;
}) {
  return (
    <Card className="hover:border-primary/30 transition-all duration-300 group border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg ${accentClass} flex items-center justify-center transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
          <Badge
            variant="outline"
            className={
              trendUp
                ? 'bg-neon-green/10 text-neon-green border-neon-green/30 text-xs'
                : 'bg-accent/10 text-accent border-accent/30 text-xs'
            }
          >
            {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1 font-mono">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function BalanceCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  percentage,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  percentage: number;
}) {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-bold font-mono">{value}</p>
        </div>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="glass rounded-lg p-3 text-center hover:border-primary/20 transition-colors cursor-default">
      <Icon className={`w-4 h-4 mx-auto mb-1.5 ${color}`} />
      <p className="text-lg font-bold font-mono">{value}</p>
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
      className="h-auto py-4 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}
