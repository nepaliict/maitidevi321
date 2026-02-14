import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Gamepad2, Percent, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts';
import { type UserRole } from '@/config/adminRoles';

const revenueData = [
  { name: 'Mon', ggr: 45000, bets: 120000, wins: 75000 },
  { name: 'Tue', ggr: 52000, bets: 135000, wins: 83000 },
  { name: 'Wed', ggr: 38000, bets: 98000, wins: 60000 },
  { name: 'Thu', ggr: 61000, bets: 150000, wins: 89000 },
  { name: 'Fri', ggr: 72000, bets: 180000, wins: 108000 },
  { name: 'Sat', ggr: 85000, bets: 210000, wins: 125000 },
  { name: 'Sun', ggr: 68000, bets: 170000, wins: 102000 },
];

const categoryData = [
  { name: 'Card Games', value: 35, color: 'hsl(187, 100%, 50%)' },
  { name: 'Casino', value: 28, color: 'hsl(270, 70%, 55%)' },
  { name: 'Sports', value: 20, color: 'hsl(45, 100%, 55%)' },
  { name: 'Live Casino', value: 12, color: 'hsl(142, 76%, 45%)' },
  { name: 'Crash', value: 5, color: 'hsl(330, 85%, 60%)' },
];

const commissionData = [
  { name: 'Super01', commission: 12500, volume: 250000 },
  { name: 'Super02', commission: 9800, volume: 196000 },
  { name: 'Master01', commission: 5600, volume: 112000 },
  { name: 'Master02', commission: 4200, volume: 84000 },
  { name: 'Master03', commission: 3100, volume: 62000 },
];

export default function AnalyticsModule({ role }: { role: UserRole }) {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Reporting & Analytics</h2>
            <p className="text-muted-foreground text-sm">GGR, commission tracking, and financial insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Gross Gaming Revenue" value="₹4,21,000" change="+15.2%" positive icon={DollarSign} />
        <KPICard title="Total Bets" value="₹10,63,000" change="+8.7%" positive icon={Gamepad2} />
        <KPICard title="Active Players" value="342" change="+23" positive icon={Users} />
        <KPICard title="House Edge" value="12.4%" change="-0.8%" positive={false} icon={Percent} />
      </div>

      {/* GGR Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            GGR Trend (Bets vs Wins vs GGR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="ggrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="name" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="ggr" stroke="hsl(187, 100%, 50%)" fill="url(#ggrGrad)" name="GGR" />
              <Line type="monotone" dataKey="bets" stroke="hsl(270, 70%, 55%)" strokeWidth={2} dot={false} name="Total Bets" />
              <Line type="monotone" dataKey="wins" stroke="hsl(142, 76%, 45%)" strokeWidth={2} dot={false} name="Player Wins" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commission by Agent */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Commission by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={commissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(215, 20%, 65%)" fontSize={11} />
                <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px' }} />
                <Bar dataKey="commission" fill="hsl(45, 100%, 55%)" radius={[4, 4, 0, 0]} name="Commission" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, positive, icon: Icon }: {
  title: string; value: string; change: string; positive: boolean; icon: any;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <Badge variant="outline" className={`text-xs ${positive ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
            {positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {change}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-bold font-mono mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
