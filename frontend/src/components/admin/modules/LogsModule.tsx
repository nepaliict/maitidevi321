import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, Download } from 'lucide-react';

interface LogsModuleProps {
  type: 'game-logs' | 'transactions' | 'activity-logs';
}

export default function LogsModule({ type }: LogsModuleProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const config = {
    'game-logs': {
      title: 'Game Logs',
      description: 'View all game activity and results',
      columns: ['User', 'Game', 'Provider', 'Type', 'Bet Amount', 'Win Amount', 'Balance Before', 'Balance After', 'Date'],
    },
    transactions: {
      title: 'Transactions',
      description: 'View all financial transactions',
      columns: ['User', 'Action', 'Wallet', 'Type', 'Amount', 'Status', 'Balance Before', 'Balance After', 'Date'],
    },
    'activity-logs': {
      title: 'Activity Logs',
      description: 'View all user activity and system events',
      columns: ['User', 'Action', 'IP Address', 'Device', 'Remarks', 'Date', 'Time'],
    },
  };

  const { title, description, columns } = config[type];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
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

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Input type="date" className="w-40" />
        <Input type="date" className="w-40" />
        {type === 'transactions' && (
          <Select defaultValue="all">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="bet">Bet</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="settlement">Settlement</SelectItem>
            </SelectContent>
          </Select>
        )}
        {type === 'activity-logs' && (
          <Select defaultValue="all">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="bet_placed">Bet Placed</SelectItem>
              <SelectItem value="deposit_request">Deposit</SelectItem>
              <SelectItem value="withdraw_request">Withdraw</SelectItem>
              <SelectItem value="kyc_request">KYC</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No {title.toLowerCase()} found. Click "Refresh" to load data.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
