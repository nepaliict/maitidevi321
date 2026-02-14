import { useState } from 'react';
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
import { Search, RefreshCw, Download, ScrollText, Receipt, Activity } from 'lucide-react';

interface LogsModuleProps {
  type: 'game-logs' | 'transactions' | 'activity-logs';
}

export default function LogsModule({ type }: LogsModuleProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const config = {
    'game-logs': {
      title: 'Game Logs',
      description: 'View all game activity and results',
      icon: ScrollText,
      columns: ['User', 'Game', 'Provider', 'Wallet', 'Type', 'Bet', 'Win', 'Before', 'After', 'Date'],
    },
    transactions: {
      title: 'Transactions',
      description: 'View all financial transactions',
      icon: Receipt,
      columns: ['User', 'Action', 'Wallet', 'Type', 'Amount', 'Status', 'Before', 'After', 'From/To', 'Date'],
    },
    'activity-logs': {
      title: 'Activity Logs',
      description: 'View all user activity and system events',
      icon: Activity,
      columns: ['User', 'Action', 'IP Address', 'Device', 'Game', 'Remarks', 'Date', 'Time'],
    },
  };

  const { title, description, columns, icon: TitleIcon } = config[type];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TitleIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user, action..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        {type === 'transactions' && (
          <Select defaultValue="all">
            <SelectTrigger className="w-40"><SelectValue placeholder="Transaction Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdraw">Withdrawal</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="bet_placed">Bet Placed</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="pl">P&L</SelectItem>
              <SelectItem value="exposure">Exposure</SelectItem>
              <SelectItem value="settlement">Settlement</SelectItem>
            </SelectContent>
          </Select>
        )}
        {type === 'transactions' && (
          <Select defaultValue="all">
            <SelectTrigger className="w-36"><SelectValue placeholder="Wallet" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wallets</SelectItem>
              <SelectItem value="main_balance">Main</SelectItem>
              <SelectItem value="bonus_balance">Bonus</SelectItem>
              <SelectItem value="pl_balance">P&L</SelectItem>
              <SelectItem value="exposure_balance">Exposure</SelectItem>
            </SelectContent>
          </Select>
        )}
        {type === 'game-logs' && (
          <Select defaultValue="all">
            <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="bet">Bet</SelectItem>
              <SelectItem value="lose">Lose</SelectItem>
              <SelectItem value="draw">Draw</SelectItem>
            </SelectContent>
          </Select>
        )}
        {type === 'activity-logs' && (
          <Select defaultValue="all">
            <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="bet_placed">Bet Placed</SelectItem>
              <SelectItem value="password_change">Password Change</SelectItem>
              <SelectItem value="profile_update">Profile Update</SelectItem>
              <SelectItem value="kyc_request">KYC Request</SelectItem>
              <SelectItem value="deposit_request">Deposit</SelectItem>
              <SelectItem value="withdraw_request">Withdraw</SelectItem>
              <SelectItem value="message">Message</SelectItem>
              <SelectItem value="transfer_coin">Transfer</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <TitleIcon className="w-10 h-10 mb-3 opacity-20" />
                    <p className="font-medium">No {title.toLowerCase()} found</p>
                    <p className="text-sm">Click "Refresh" to load data from API</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
