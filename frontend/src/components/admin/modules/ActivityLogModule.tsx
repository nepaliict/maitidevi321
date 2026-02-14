import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Download, Activity, Monitor, Smartphone, Globe } from 'lucide-react';
import { type UserRole } from '@/config/adminRoles';

const mockLogs = [
  { id: '1', user: 'master01', action: 'login', ip: '192.168.1.100', device: 'Chrome / Windows', remarks: 'Successful login', created_at: '2026-02-14T10:30:00Z' },
  { id: '2', user: 'player01', action: 'deposit_request', ip: '10.0.0.5', device: 'Safari / iPhone', remarks: 'Amount: ₹5000, Method: eSewa', created_at: '2026-02-14T10:25:00Z' },
  { id: '3', user: 'master01', action: 'deposit_approved', ip: '192.168.1.100', device: 'Chrome / Windows', remarks: 'Approved deposit DEP-001 for player01', created_at: '2026-02-14T10:31:00Z' },
  { id: '4', user: 'player02', action: 'bet_placed', ip: '172.16.0.15', device: 'Firefox / Android', remarks: 'Game: Teen Patti, Amount: ₹500', created_at: '2026-02-14T09:45:00Z' },
  { id: '5', user: 'player02', action: 'game_win', ip: '172.16.0.15', device: 'Firefox / Android', remarks: 'Won ₹8000 on Teen Patti round-101', created_at: '2026-02-14T09:50:00Z' },
  { id: '6', user: 'super01', action: 'settlement', ip: '10.10.10.1', device: 'Chrome / macOS', remarks: 'Settled master01, Amount: ₹45000', created_at: '2026-02-14T08:00:00Z' },
  { id: '7', user: 'player03', action: 'kyc_submitted', ip: '192.168.5.20', device: 'Safari / iPhone', remarks: 'Document: Citizenship', created_at: '2026-02-13T15:20:00Z' },
  { id: '8', user: 'master02', action: 'kyc_approved', ip: '10.0.0.50', device: 'Edge / Windows', remarks: 'Approved KYC for player03', created_at: '2026-02-13T16:00:00Z' },
  { id: '9', user: 'player01', action: 'password_change', ip: '10.0.0.5', device: 'Safari / iPhone', remarks: 'Password changed successfully', created_at: '2026-02-13T14:30:00Z' },
  { id: '10', user: 'player04', action: 'failed_login', ip: '203.0.113.42', device: 'Unknown', remarks: 'Invalid password attempt 3/5', created_at: '2026-02-13T12:00:00Z' },
];

const actionColors: Record<string, string> = {
  login: 'bg-neon-green/20 text-neon-green',
  logout: 'bg-muted text-muted-foreground',
  deposit_request: 'bg-primary/20 text-primary',
  deposit_approved: 'bg-neon-green/20 text-neon-green',
  withdrawal_request: 'bg-accent/20 text-accent',
  withdrawal_approved: 'bg-neon-green/20 text-neon-green',
  bet_placed: 'bg-neon-purple/20 text-neon-purple',
  game_win: 'bg-neon-gold/20 text-neon-gold',
  game_loss: 'bg-destructive/20 text-destructive',
  settlement: 'bg-primary/20 text-primary',
  kyc_submitted: 'bg-accent/20 text-accent',
  kyc_approved: 'bg-neon-green/20 text-neon-green',
  password_change: 'bg-muted text-foreground',
  failed_login: 'bg-destructive/20 text-destructive',
};

export default function ActivityLogModule({ role }: { role: UserRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = mockLogs.filter((l) => {
    const matchesSearch = l.user.includes(searchQuery) || l.remarks.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) return <Smartphone className="w-3 h-3" />;
    if (device.includes('Unknown')) return <Globe className="w-3 h-3" />;
    return <Monitor className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Activity Logs</h2>
            <p className="text-muted-foreground text-sm">Comprehensive audit trail of all user actions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user or details..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Action type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="deposit_request">Deposit Request</SelectItem>
            <SelectItem value="deposit_approved">Deposit Approved</SelectItem>
            <SelectItem value="bet_placed">Bet Placed</SelectItem>
            <SelectItem value="game_win">Game Win</SelectItem>
            <SelectItem value="settlement">Settlement</SelectItem>
            <SelectItem value="kyc_submitted">KYC Submitted</SelectItem>
            <SelectItem value="password_change">Password Change</SelectItem>
            <SelectItem value="failed_login">Failed Login</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge className={`${actionColors[log.action] || 'bg-muted text-foreground'} border-0 text-xs`}>
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {getDeviceIcon(log.device)}
                      <span className="truncate max-w-[120px]">{log.device}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.remarks}</TableCell>
                  <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
