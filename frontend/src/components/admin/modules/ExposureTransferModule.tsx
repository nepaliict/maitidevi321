import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowDownToLine, Lock, AlertTriangle, Search } from 'lucide-react';
import PinVerificationModal from '@/components/modals/PinVerificationModal';
import { toast } from 'sonner';

const mockPlayers = [
  { id: 'p-1', username: 'player01', main_balance: 10000, exposure_balance: 3000, bonus_balance: 500 },
  { id: 'p-2', username: 'player02', main_balance: 5000, exposure_balance: 8000, bonus_balance: 0 },
  { id: 'p-3', username: 'player03', main_balance: 2000, exposure_balance: 0, bonus_balance: 1500 },
];

export default function ExposureTransferModule() {
  const [selectedPlayer, setSelectedPlayer] = useState<typeof mockPlayers[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTransfer = (player: typeof mockPlayers[0]) => {
    if (player.exposure_balance === 0) {
      toast.error('No exposure balance to transfer');
      return;
    }
    setSelectedPlayer(player);
    setAmount(String(player.exposure_balance));
    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (selectedPlayer?.exposure_balance || 0)) {
      toast.error('Invalid amount');
      return;
    }
    setShowDialog(false);
    setShowPin(true);
  };

  const handlePinVerify = async (pin: string) => {
    if (pin === '123456') {
      toast.success(`₹${amount} transferred from exposure to main for ${selectedPlayer?.username}`);
      return true;
    }
    return false;
  };

  const filtered = mockPlayers.filter((p) => p.username.includes(searchQuery));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-neon-purple/10 flex items-center justify-center">
          <ArrowDownToLine className="w-5 h-5 text-neon-purple" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Exposure Transfer</h2>
          <p className="text-muted-foreground text-sm">Convert player exposure balance to main balance</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search player..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Player</TableHead>
                <TableHead>Main Balance</TableHead>
                <TableHead>Exposure Balance</TableHead>
                <TableHead>Bonus Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{p.username}</TableCell>
                  <TableCell className="font-mono">₹{p.main_balance.toLocaleString()}</TableCell>
                  <TableCell className={`font-mono ${p.exposure_balance > 0 ? 'text-neon-purple font-bold' : 'text-muted-foreground'}`}>
                    ₹{p.exposure_balance.toLocaleString()}
                    {p.exposure_balance > 0 && <Lock className="w-3 h-3 inline ml-1" />}
                  </TableCell>
                  <TableCell className="font-mono">₹{p.bonus_balance.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" disabled={p.exposure_balance === 0} onClick={() => handleTransfer(p)}>
                      Transfer to Main
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Exposure to Main</DialogTitle>
            <DialogDescription>Move funds from {selectedPlayer?.username}'s exposure to main balance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="glass rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Available Exposure Balance</p>
              <p className="text-2xl font-bold font-mono text-neon-purple">₹{selectedPlayer?.exposure_balance.toLocaleString()}</p>
            </div>
            <div>
              <Label>Amount to Transfer</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} max={selectedPlayer?.exposure_balance} />
              <p className="text-xs text-muted-foreground mt-1">Max: ₹{selectedPlayer?.exposure_balance.toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Proceed with PIN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinVerificationModal open={showPin} onClose={() => setShowPin(false)} onVerify={handlePinVerify}
        title="Exposure Transfer PIN" description={`Enter PIN to transfer exposure for ${selectedPlayer?.username}`} />
    </div>
  );
}
