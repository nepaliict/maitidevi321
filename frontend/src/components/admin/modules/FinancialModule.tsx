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
import { Textarea } from '@/components/ui/textarea';
import {
  Search, RefreshCw, Download, Check, X, Eye, ArrowUpDown, Plus,
  ArrowDownToLine, ArrowUpFromLine, Clock, CheckCircle2, XCircle, Ban,
} from 'lucide-react';
import { type UserRole } from '@/config/adminRoles';

interface FinancialModuleProps {
  role: UserRole;
  type: 'deposits' | 'withdrawals';
}

export default function FinancialModule({ role, type }: FinancialModuleProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const label = type === 'deposits' ? 'Deposit' : 'Withdrawal';
  const isDeposit = type === 'deposits';

  const filtered = useMemo(() => {
    return items.filter((item: any) => {
      const matchesSearch = item.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id?.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const summaryCards = [
    { label: 'Total', value: '—', icon: isDeposit ? ArrowDownToLine : ArrowUpFromLine, color: 'text-foreground' },
    { label: 'Pending', value: '—', icon: Clock, color: 'text-accent' },
    { label: 'Approved', value: '—', icon: CheckCircle2, color: 'text-neon-green' },
    { label: 'Rejected', value: '—', icon: XCircle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{label} Management</h2>
          <p className="text-muted-foreground">Review and manage {type}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add {label}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create {label}</DialogTitle>
                <DialogDescription>Add a new {label.toLowerCase()} request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>User</Label>
                  <Input placeholder="Username or ID" />
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input type="number" placeholder="Enter amount" />
                </div>
                <div>
                  <Label>Payment Mode</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Textarea placeholder="Optional remarks..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button>Create {label}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${card.color === 'text-foreground' ? 'bg-muted' : card.color.replace('text-', 'bg-') + '/10'} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user or ID..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" placeholder="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" className="w-40" placeholder="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center text-muted-foreground">
                      {isDeposit ? (
                        <ArrowDownToLine className="w-10 h-10 mb-3 opacity-20" />
                      ) : (
                        <ArrowUpFromLine className="w-10 h-10 mb-3 opacity-20" />
                      )}
                      <p className="font-medium">No {type} found</p>
                      <p className="text-sm">Click "Refresh" to load data from API</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-xs">{item.id?.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{item.user || '—'}</TableCell>
                    <TableCell className="font-mono font-bold">₹{item.amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{item.payment_mode || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'approved' ? 'default' :
                        item.status === 'rejected' ? 'destructive' :
                        item.status === 'cancelled' ? 'secondary' :
                        'secondary'
                      }
                      className={item.status === 'approved' ? 'bg-neon-green/20 text-neon-green border-0' : item.status === 'pending' ? 'bg-accent/20 text-accent border-0' : ''}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{item.remarks || '—'}</TableCell>
                    <TableCell className="text-sm">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="View"><Eye className="w-4 h-4" /></Button>
                        {item.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" title="Approve" className="text-neon-green hover:text-neon-green">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Reject" className="text-destructive hover:text-destructive">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
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
