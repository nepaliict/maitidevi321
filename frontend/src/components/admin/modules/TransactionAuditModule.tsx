import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Download, ArrowUpDown, ArrowDownToLine, ArrowUpFromLine, Receipt, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { type UserRole } from '@/config/adminRoles';

interface TransactionAuditModuleProps {
  role: UserRole;
}

// Mock double-entry transactions
const mockTransactions = [
  {
    id: 'txn-001', paired_id: 'txn-002', user_id: 'user-1', username: 'player01',
    action_type: 'out' as const, wallet: 'main_balance', amount: 5000,
    balance_before: 15000, balance_after: 10000,
    transaction_type: 'deposit_approval', reference_id: 'dep-001',
    counterparty: 'master01', created_at: '2026-02-14T10:30:00Z',
  },
  {
    id: 'txn-002', paired_id: 'txn-001', user_id: 'user-2', username: 'master01',
    action_type: 'in' as const, wallet: 'main_balance', amount: 5000,
    balance_before: 50000, balance_after: 45000,
    transaction_type: 'deposit_approval', reference_id: 'dep-001',
    counterparty: 'player01', created_at: '2026-02-14T10:30:00Z',
  },
  {
    id: 'txn-003', paired_id: 'txn-004', user_id: 'user-3', username: 'player02',
    action_type: 'in' as const, wallet: 'main_balance', amount: 8000,
    balance_before: 2000, balance_after: 10000,
    transaction_type: 'game_win', reference_id: 'game-round-101',
    counterparty: 'system', created_at: '2026-02-14T09:15:00Z',
  },
  {
    id: 'txn-004', paired_id: 'txn-003', user_id: 'user-4', username: 'master02',
    action_type: 'out' as const, wallet: 'pl_balance', amount: 8000,
    balance_before: 20000, balance_after: 12000,
    transaction_type: 'game_win', reference_id: 'game-round-101',
    counterparty: 'player02', created_at: '2026-02-14T09:15:00Z',
  },
];

export default function TransactionAuditModule({ role }: TransactionAuditModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [walletFilter, setWalletFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return mockTransactions.filter((t) => {
      const matchesSearch = t.username.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.includes(searchQuery);
      const matchesType = typeFilter === 'all' || t.transaction_type === typeFilter;
      const matchesWallet = walletFilter === 'all' || t.wallet === walletFilter;
      return matchesSearch && matchesType && matchesWallet;
    });
  }, [searchQuery, typeFilter, walletFilter]);

  // Reconciliation check
  const reconciliationOk = useMemo(() => {
    const totalIn = filtered.filter((t) => t.action_type === 'in').reduce((s, t) => s + t.amount, 0);
    const totalOut = filtered.filter((t) => t.action_type === 'out').reduce((s, t) => s + t.amount, 0);
    return totalIn === totalOut;
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Transaction Audit Trail</h2>
            <p className="text-muted-foreground text-sm">Double-entry ledger with balance snapshots</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </div>

      {/* Reconciliation Status */}
      <Card className={`border-2 ${reconciliationOk ? 'border-neon-green/30' : 'border-destructive/30'}`}>
        <CardContent className="p-4 flex items-center gap-3">
          {reconciliationOk ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-neon-green" />
              <div>
                <p className="font-semibold text-neon-green">Reconciliation Passed</p>
                <p className="text-xs text-muted-foreground">All IN amounts match OUT amounts. Ledger is balanced.</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Reconciliation Mismatch</p>
                <p className="text-xs text-muted-foreground">Total IN and OUT amounts do not match. Investigate immediately.</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user or txn ID..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit_approval">Deposit</SelectItem>
            <SelectItem value="withdrawal_approval">Withdrawal</SelectItem>
            <SelectItem value="game_win">Game Win</SelectItem>
            <SelectItem value="game_loss">Game Loss</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="settlement">Settlement</SelectItem>
            <SelectItem value="bonus">Bonus</SelectItem>
          </SelectContent>
        </Select>
        <Select value={walletFilter} onValueChange={setWalletFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Wallet" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wallets</SelectItem>
            <SelectItem value="main_balance">Main Balance</SelectItem>
            <SelectItem value="pl_balance">P&L Balance</SelectItem>
            <SelectItem value="bonus_balance">Bonus Balance</SelectItem>
            <SelectItem value="exposure_balance">Exposure</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Txn ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.username}</TableCell>
                  <TableCell>
                    {t.action_type === 'in' ? (
                      <Badge className="bg-neon-green/20 text-neon-green border-0"><ArrowDownToLine className="w-3 h-3 mr-1" />IN</Badge>
                    ) : (
                      <Badge className="bg-destructive/20 text-destructive border-0"><ArrowUpFromLine className="w-3 h-3 mr-1" />OUT</Badge>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{t.wallet.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="font-mono font-bold">₹{t.amount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">₹{t.balance_before.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-sm">₹{t.balance_after.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{t.transaction_type.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-sm">{t.counterparty}</TableCell>
                  <TableCell className="text-sm">{new Date(t.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
