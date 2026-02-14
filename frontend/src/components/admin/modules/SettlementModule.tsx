import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Banknote, AlertTriangle, CheckCircle2, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PinVerificationModal from '@/components/modals/PinVerificationModal';
import { toast } from 'sonner';
import { type UserRole } from '@/config/adminRoles';

const mockMasters = [
  { id: 'u-1', username: 'master01', main_balance: 45000, pl_balance: 12000, total: 57000, players: 15 },
  { id: 'u-2', username: 'master02', main_balance: 30000, pl_balance: -5000, total: 25000, players: 8 },
  { id: 'u-3', username: 'master03', main_balance: 18000, pl_balance: 8500, total: 26500, players: 12 },
];

export default function SettlementModule({ role }: { role: UserRole }) {
  const [selectedMaster, setSelectedMaster] = useState<typeof mockMasters[0] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSettle = (master: typeof mockMasters[0]) => {
    setSelectedMaster(master);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setShowPin(true);
  };

  const handlePinVerify = async (pin: string) => {
    // Simulate PIN verification
    if (pin === '123456') {
      toast.success(`Settlement completed for ${selectedMaster?.username}. ₹${selectedMaster?.total.toLocaleString()} transferred.`);
      setSelectedMaster(null);
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Banknote className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Settlement</h2>
          <p className="text-muted-foreground text-sm">Settle Master accounts and collect balances</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Master</TableHead>
                <TableHead>Main Balance</TableHead>
                <TableHead>P&L Balance</TableHead>
                <TableHead>Settlement Total</TableHead>
                <TableHead>Players</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMasters.map((m) => (
                <TableRow key={m.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{m.username}</TableCell>
                  <TableCell className="font-mono">₹{m.main_balance.toLocaleString()}</TableCell>
                  <TableCell className={`font-mono ${m.pl_balance < 0 ? 'text-destructive' : 'text-neon-green'}`}>
                    {m.pl_balance < 0 ? '-' : '+'}₹{Math.abs(m.pl_balance).toLocaleString()}
                  </TableCell>
                  <TableCell className={`font-mono font-bold ${m.total < 0 ? 'text-destructive' : ''}`}>
                    ₹{m.total.toLocaleString()}
                  </TableCell>
                  <TableCell>{m.players}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleSettle(m)}>
                      <Banknote className="w-4 h-4 mr-2" />Settle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Settlement</DialogTitle>
            <DialogDescription>Review the settlement details below</DialogDescription>
          </DialogHeader>
          {selectedMaster && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Main Balance</p>
                  <p className="text-xl font-bold font-mono">₹{selectedMaster.main_balance.toLocaleString()}</p>
                </div>
                <div className="glass rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">P&L Balance</p>
                  <p className={`text-xl font-bold font-mono ${selectedMaster.pl_balance < 0 ? 'text-destructive' : 'text-neon-green'}`}>
                    {selectedMaster.pl_balance < 0 ? '-' : '+'}₹{Math.abs(selectedMaster.pl_balance).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="glass rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Settlement Amount</p>
                <p className={`text-3xl font-bold font-mono ${selectedMaster.total < 0 ? 'text-destructive' : 'text-neon-green'}`}>
                  ₹{selectedMaster.total.toLocaleString()}
                </p>
              </div>
              {selectedMaster.total < 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Negative settlement: Your balance will decrease by ₹{Math.abs(selectedMaster.total).toLocaleString()}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground text-center">
                Master's balances will be reset to ₹0 after settlement.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Proceed with PIN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinVerificationModal
        open={showPin}
        onClose={() => setShowPin(false)}
        onVerify={handlePinVerify}
        title="Settlement PIN"
        description={`Enter PIN to settle ${selectedMaster?.username}`}
      />
    </div>
  );
}
