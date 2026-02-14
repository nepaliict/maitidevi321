import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Monitor, Smartphone, Globe, LogOut, Search, RefreshCw, Shield, Clock } from 'lucide-react';
import { type UserRole } from '@/config/adminRoles';
import { toast } from 'sonner';

const mockSessions = [
  { id: 's-001', user: 'player01', ip: '192.168.1.100', device: 'Chrome 120 / Windows 11', location: 'Kathmandu, NP', started_at: '2026-02-14T08:00:00Z', last_active: '2026-02-14T10:30:00Z', status: 'active' },
  { id: 's-002', user: 'master01', ip: '10.0.0.50', device: 'Safari 17 / macOS Sonoma', location: 'Pokhara, NP', started_at: '2026-02-14T07:30:00Z', last_active: '2026-02-14T10:28:00Z', status: 'active' },
  { id: 's-003', user: 'player02', ip: '172.16.0.15', device: 'Firefox 122 / Android 14', location: 'Biratnagar, NP', started_at: '2026-02-14T09:00:00Z', last_active: '2026-02-14T09:55:00Z', status: 'active' },
  { id: 's-004', user: 'player03', ip: '203.0.113.42', device: 'Chrome 120 / iPhone 15', location: 'Bharatpur, NP', started_at: '2026-02-13T15:00:00Z', last_active: '2026-02-13T18:00:00Z', status: 'expired' },
  { id: 's-005', user: 'player04', ip: '198.51.100.7', device: 'Unknown Browser', location: 'Unknown', started_at: '2026-02-13T12:00:00Z', last_active: '2026-02-13T12:05:00Z', status: 'terminated' },
];

export default function SessionManagementModule({ role }: { role: UserRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const activeSessions = mockSessions.filter((s) => s.status === 'active').length;

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) return <Smartphone className="w-4 h-4" />;
    if (device.includes('Unknown')) return <Globe className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const handleTerminate = (sessionId: string) => {
    toast.success(`Session ${sessionId} terminated`);
  };

  const filtered = mockSessions.filter((s) =>
    s.user.includes(searchQuery) || s.ip.includes(searchQuery) || s.device.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Session Management</h2>
            <p className="text-muted-foreground text-sm">Active sessions, device info & IP tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-neon-green/20 text-neon-green border-0 text-sm px-3 py-1.5">
            {activeSessions} Active Sessions
          </Badge>
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by user, IP, or device..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>User</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{s.user}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      {getDeviceIcon(s.device)}
                      <span className="truncate max-w-[150px]">{s.device}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.ip}</TableCell>
                  <TableCell className="text-sm">{s.location}</TableCell>
                  <TableCell className="text-sm">{new Date(s.started_at).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{new Date(s.last_active).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={
                      s.status === 'active' ? 'bg-neon-green/20 text-neon-green border-0' :
                      s.status === 'expired' ? 'bg-muted text-muted-foreground border-0' :
                      'bg-destructive/20 text-destructive border-0'
                    }>
                      {s.status === 'active' && <Clock className="w-3 h-3 mr-1" />}
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {s.status === 'active' && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleTerminate(s.id)}>
                        <LogOut className="w-4 h-4 mr-1" /> Terminate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
