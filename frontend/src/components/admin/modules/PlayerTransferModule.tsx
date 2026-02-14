import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRightLeft, AlertTriangle, Clock, CheckCircle2, Lock, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function PlayerTransferModule() {
  const [showTransfer, setShowTransfer] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockTransfers = [
    { id: 'pt-001', from: 'player01', to: 'player03', amount: 1000, status: 'completed', created_at: '2026-02-14T10:00:00Z' },
    { id: 'pt-002', from: 'player02', to: 'player01', amount: 500, status: 'completed', created_at: '2026-02-14T09:30:00Z' },
    { id: 'pt-003', from: 'player04', to: 'player02', amount: 2000, status: 'rate_limited', created_at: '2026-02-14T09:00:00Z' },
  ];

  // Rate limit: max 5 per hour
  const transfersThisHour = 2;
  const maxTransfers = 5;

  const handleTransfer = async () => {
    if (!recipient || !amount || !password) {
      toast.error('All fields are required');
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be positive');
      return;
    }
    if (transfersThisHour >= maxTransfers) {
      toast.error('Rate limit reached. Max 5 transfers per hour.');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(`₹${amount} transferred to ${recipient}`);
      setShowTransfer(false);
      setRecipient('');
      setAmount('');
      setPassword('');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Player-to-Player Transfer</h2>
            <p className="text-muted-foreground text-sm">Send funds to other players with password confirmation</p>
          </div>
        </div>
        <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
          <DialogTrigger asChild>
            <Button><ArrowRightLeft className="w-4 h-4 mr-2" />New Transfer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Funds</DialogTitle>
              <DialogDescription>Send funds from your main balance to another player.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Rate limit warning */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 text-accent text-sm">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{transfersThisHour}/{maxTransfers} transfers used this hour</span>
              </div>
              <div>
                <Label>Recipient Username</Label>
                <Input placeholder="Enter player username" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Min: ₹100 | Max: ₹50,000</p>
              </div>
              <div>
                <Label className="flex items-center gap-2"><Lock className="w-3 h-3" />Confirm Password</Label>
                <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Password required for security verification</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Transfers are irreversible. Verify the recipient username carefully.</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTransfer(false)}>Cancel</Button>
              <Button onClick={handleTransfer} disabled={loading}>{loading ? 'Processing...' : 'Confirm Transfer'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Transfers */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search transfers..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransfers.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.from}</TableCell>
                  <TableCell className="font-medium">{t.to}</TableCell>
                  <TableCell className="font-mono font-bold">₹{t.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={t.status === 'completed' ? 'bg-neon-green/20 text-neon-green border-0' : 'bg-destructive/20 text-destructive border-0'}>
                      {t.status === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      {t.status}
                    </Badge>
                  </TableCell>
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
