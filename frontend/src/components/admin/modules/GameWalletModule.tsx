import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Wallet, Gamepad2, Lock, Zap, TrendingUp, AlertTriangle, Gift, ArrowRight } from 'lucide-react';

/**
 * Game Wallet Selection Logic Display
 * Shows how wallet selection works: main → bonus fallback, exposure split on wins
 */

export default function GameWalletModule() {
  // Mock player wallet state
  const wallets = {
    main_balance: 2500,
    bonus_balance: 1000,
    exposure_balance: 3000,
    exposure_limit: 5000,
  };

  const minBet = 100;
  const canPlayMain = wallets.main_balance >= minBet;
  const canPlayBonus = wallets.bonus_balance >= minBet;
  const selectedWallet = canPlayMain ? 'main_balance' : canPlayBonus ? 'bonus_balance' : null;

  // Bonus roll tracking
  const bonusRollRequired = 50000;
  const bonusRollCurrent = 32000;
  const bonusProgress = (bonusRollCurrent / bonusRollRequired) * 100;
  const bonusUnlocked = bonusRollCurrent >= bonusRollRequired;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Game Wallet & Bonus Tracking</h2>
          <p className="text-muted-foreground text-sm">Wallet selection logic, exposure splits, and bonus roll progress</p>
        </div>
      </div>

      {/* Wallet Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WalletCard
          label="Main Balance" value={wallets.main_balance}
          icon={Wallet} color="text-neon-green" bgColor="bg-neon-green/10"
          selected={selectedWallet === 'main_balance'} priority={1}
        />
        <WalletCard
          label="Bonus Balance" value={wallets.bonus_balance}
          icon={Gift} color="text-accent" bgColor="bg-accent/10"
          selected={selectedWallet === 'bonus_balance'} priority={2}
          sublabel="Fallback wallet"
        />
        <WalletCard
          label="Exposure Balance" value={wallets.exposure_balance}
          icon={Lock} color="text-neon-purple" bgColor="bg-neon-purple/10"
          locked sublabel="Cannot play with this"
        />
        <WalletCard
          label="Exposure Limit" value={wallets.exposure_limit}
          icon={AlertTriangle} color="text-accent" bgColor="bg-accent/10"
          sublabel="Win split threshold"
        />
      </div>

      {/* Wallet Selection Flow */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            Wallet Selection Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Step label="Check Main Balance" detail={`₹${wallets.main_balance} ${canPlayMain ? '≥' : '<'} ₹${minBet}`} status={canPlayMain ? 'pass' : 'fail'} />
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            {!canPlayMain && (
              <>
                <Step label="Check Bonus Balance" detail={`₹${wallets.bonus_balance} ${canPlayBonus ? '≥' : '<'} ₹${minBet}`} status={canPlayBonus ? 'pass' : 'fail'} />
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </>
            )}
            <Step
              label={selectedWallet ? `Use ${selectedWallet.replace('_', ' ')}` : 'Insufficient Balance'}
              detail={selectedWallet ? 'Ready to play' : 'Cannot play'}
              status={selectedWallet ? 'selected' : 'fail'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Win Split Example */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            Exposure Split on Win (Example)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">Win Amount</p>
              <p className="text-2xl font-bold font-mono text-neon-green">₹8,000</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">→ Main Balance</p>
              <p className="text-2xl font-bold font-mono">₹{Math.min(8000, wallets.exposure_limit).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Up to exposure limit</p>
            </div>
            <div className="glass rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground">→ Exposure Balance</p>
              <p className="text-2xl font-bold font-mono text-neon-purple">₹{Math.max(0, 8000 - wallets.exposure_limit).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Above exposure limit (locked)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bonus Roll Tracking */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            Bonus Roll Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Welcome Bonus - 100% Deposit Match</p>
              <p className="text-xs text-muted-foreground">Wagering requirement: {bonusRollRequired.toLocaleString()}x</p>
            </div>
            <Badge className={bonusUnlocked ? 'bg-neon-green/20 text-neon-green border-0' : 'bg-accent/20 text-accent border-0'}>
              {bonusUnlocked ? 'Unlocked ✓' : 'In Progress'}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono font-bold">{bonusProgress.toFixed(1)}%</span>
            </div>
            <Progress value={bonusProgress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹{bonusRollCurrent.toLocaleString()} wagered</span>
              <span>₹{bonusRollRequired.toLocaleString()} required</span>
            </div>
          </div>
          {!bonusUnlocked && (
            <div className="p-3 rounded-lg bg-accent/10 text-sm text-accent flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>₹{(bonusRollRequired - bonusRollCurrent).toLocaleString()} more wagering needed to unlock bonus withdrawal</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WalletCard({ label, value, icon: Icon, color, bgColor, selected, priority, locked, sublabel }: {
  label: string; value: number; icon: any; color: string; bgColor: string;
  selected?: boolean; priority?: number; locked?: boolean; sublabel?: string;
}) {
  return (
    <Card className={`border-border/50 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold font-mono">₹{value.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selected && <Badge className="bg-primary/20 text-primary border-0 text-xs">Selected</Badge>}
          {priority && <Badge variant="outline" className="text-xs">Priority {priority}</Badge>}
          {locked && <Badge className="bg-destructive/20 text-destructive border-0 text-xs"><Lock className="w-3 h-3 mr-1" />Locked</Badge>}
        </div>
        {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}

function Step({ label, detail, status }: { label: string; detail: string; status: 'pass' | 'fail' | 'selected' }) {
  const colors = {
    pass: 'border-neon-green/30 bg-neon-green/5',
    fail: 'border-destructive/30 bg-destructive/5',
    selected: 'border-primary/50 bg-primary/10 ring-1 ring-primary/30',
  };
  return (
    <div className={`rounded-lg px-4 py-3 border ${colors[status]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
