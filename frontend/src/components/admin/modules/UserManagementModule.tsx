import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search, Plus, RefreshCw, Download, Eye, Edit, Ban, Coins, UserPlus, ArrowUpDown, Users,
  Shield, Wallet, MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { type UserRole } from '@/config/adminRoles';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

interface UserManagementModuleProps {
  role: UserRole;
  targetRole: 'super' | 'master' | 'player';
}

export default function UserManagementModule({ role, targetRole }: UserManagementModuleProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [sortField, setSortField] = useState<string>('username');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '', username: '', password: '', full_name: '', phone: '', commission_percentage: '10',
  });

  const roleLabel = targetRole === 'super' ? 'Super Admin' : targetRole === 'master' ? 'Master' : 'Player';

  const filteredUsers = useMemo(() => {
    let result = users.filter((u: any) => {
      const matchesSearch =
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active);
      const matchesKyc = kycFilter === 'all' || u.kyc_status === kycFilter;
      return matchesSearch && matchesStatus && matchesKyc;
    });
    result.sort((a: any, b: any) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [users, searchQuery, statusFilter, kycFilter, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getUsers({ role: targetRole });
      setUsers(data);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      await apiClient.createUser({ ...newUser, role: targetRole });
      toast.success(`${roleLabel} created successfully`);
      setShowCreateDialog(false);
      setNewUser({ email: '', username: '', password: '', full_name: '', phone: '', commission_percentage: '10' });
      handleRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally { setLoading(false); }
  };

  const handleToggleSuspend = async (userId: string, username: string) => {
    try {
      await apiClient.suspendUser(userId);
      toast.success(`User ${username} status toggled`);
      handleRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const exportCSV = () => {
    const headers = ['Username', 'Email', 'Full Name', 'Status', 'KYC', 'Balance'];
    const rows = filteredUsers.map((u: any) => [
      u.username, u.email, u.full_name || '', u.is_active ? 'Active' : 'Suspended', u.kyc_status || 'pending', u.wallet_balance || 0,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${targetRole}_users.csv`; a.click();
  };

  // Summary stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const pendingKyc = users.filter((u) => u.kyc_status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{roleLabel} Management</h2>
            <p className="text-muted-foreground text-sm">Manage all {roleLabel.toLowerCase()} accounts</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {role !== 'player' && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add {roleLabel}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create {roleLabel}</DialogTitle>
                  <DialogDescription>Add a new {roleLabel.toLowerCase()} account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Email</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
                    <div><Label>Username</Label><Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Password</Label><Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} /></div>
                    <div><Label>Full Name</Label><Input value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Phone</Label><Input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} /></div>
                    <div><Label>Commission %</Label><Input type="number" value={newUser.commission_percentage} onChange={(e) => setNewUser({ ...newUser, commission_percentage: e.target.value })} /></div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateUser} disabled={loading}>{loading ? 'Creating...' : `Create ${roleLabel}`}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <div><p className="text-2xl font-bold font-mono">{totalUsers}</p><p className="text-xs text-muted-foreground">Total {roleLabel}s</p></div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neon-green/10 flex items-center justify-center"><Shield className="w-4 h-4 text-neon-green" /></div>
            <div><p className="text-2xl font-bold font-mono">{activeUsers}</p><p className="text-xs text-muted-foreground">Active</p></div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center"><Wallet className="w-4 h-4 text-accent" /></div>
            <div><p className="text-2xl font-bold font-mono">{pendingKyc}</p><p className="text-xs text-muted-foreground">Pending KYC</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={kycFilter} onValueChange={setKycFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="KYC" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All KYC</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort('username')}>
                    User <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort('wallet_balance')}>
                    Balance <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Users className="w-10 h-10 mb-3 opacity-20" />
                      <p className="font-medium">No {roleLabel.toLowerCase()} users found</p>
                      <p className="text-sm">Click "Refresh" to load data from API</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-sm font-bold">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.username}</p>
                          <p className="text-xs text-muted-foreground">{u.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell className="text-sm">{u.phone || '—'}</TableCell>
                    <TableCell className="font-mono text-sm font-medium">₹{u.wallet_balance?.toLocaleString() || '0'}</TableCell>
                    <TableCell className="font-mono text-sm">{u.commission_percentage || 10}%</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.kyc_status === 'approved' ? 'default' : u.kyc_status === 'rejected' ? 'destructive' : 'secondary'}
                        className={u.kyc_status === 'approved' ? 'bg-neon-green/20 text-neon-green border-0' : u.kyc_status === 'pending' ? 'bg-accent/20 text-accent border-0' : ''}
                      >
                        {u.kyc_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.is_active ? (
                        <Badge className="bg-neon-green/20 text-neon-green border-0">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit User</DropdownMenuItem>
                          <DropdownMenuItem><Coins className="w-4 h-4 mr-2" /> Deposit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleToggleSuspend(u.id, u.username)}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
