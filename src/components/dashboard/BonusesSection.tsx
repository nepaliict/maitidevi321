import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Gift,
  Clock,
  Check,
  Copy,
  Star,
  Zap,
  Trophy,
  Users,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Bonus {
  id: string;
  name: string;
  type: "welcome" | "deposit" | "referral" | "cashback" | "vip" | "special";
  amount: number;
  wagering: number;
  wageringProgress: number;
  expiresAt: string;
  status: "active" | "claimed" | "expired" | "available";
  description: string;
}

const bonuses: Bonus[] = [
  {
    id: "1",
    name: "Welcome Bonus",
    type: "welcome",
    amount: 5000,
    wagering: 30000,
    wageringProgress: 18000,
    expiresAt: "2024-02-15",
    status: "active",
    description: "100% match on your first deposit up to ₹5,000",
  },
  {
    id: "2",
    name: "Weekly Cashback",
    type: "cashback",
    amount: 1500,
    wagering: 0,
    wageringProgress: 0,
    expiresAt: "2024-01-20",
    status: "available",
    description: "10% cashback on last week's losses",
  },
  {
    id: "3",
    name: "Referral Bonus",
    type: "referral",
    amount: 500,
    wagering: 2500,
    wageringProgress: 2500,
    expiresAt: "2024-01-25",
    status: "claimed",
    description: "Bonus for referring a friend who deposited",
  },
  {
    id: "4",
    name: "VIP Reload Bonus",
    type: "vip",
    amount: 2000,
    wagering: 0,
    wageringProgress: 0,
    expiresAt: "2024-01-18",
    status: "available",
    description: "Exclusive 20% reload bonus for VIP members",
  },
  {
    id: "5",
    name: "Weekend Special",
    type: "special",
    amount: 1000,
    wagering: 5000,
    wageringProgress: 0,
    expiresAt: "2024-01-14",
    status: "expired",
    description: "50% bonus on weekend deposits",
  },
];

const promoCodes = [
  { code: "KARNA100", discount: "100% Match Bonus", minDeposit: 500 },
  { code: "FRIDAY50", discount: "50% Bonus", minDeposit: 1000 },
  { code: "VIP2024", discount: "VIP Access + ₹2000", minDeposit: 5000 },
];

export function BonusesSection() {
  const [filter, setFilter] = useState<string>("all");
  const [promoCode, setPromoCode] = useState("");

  const filteredBonuses = bonuses.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "welcome":
        return <Gift className="w-5 h-5" />;
      case "deposit":
        return <Zap className="w-5 h-5" />;
      case "referral":
        return <Users className="w-5 h-5" />;
      case "cashback":
        return <Trophy className="w-5 h-5" />;
      case "vip":
        return <Star className="w-5 h-5" />;
      case "special":
        return <Calendar className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-neon-green bg-neon-green/10 border-neon-green/30";
      case "available":
        return "text-primary bg-primary/10 border-primary/30";
      case "claimed":
        return "text-accent bg-accent/10 border-accent/30";
      case "expired":
        return "text-muted-foreground bg-muted border-border";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied to clipboard!`);
  };

  const applyPromoCode = () => {
    if (promoCode.trim()) {
      toast.success("Promo code applied successfully!");
      setPromoCode("");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Active Bonuses</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">
            {bonuses.filter((b) => b.status === "active").length}
          </p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">
            {bonuses.filter((b) => b.status === "available").length}
          </p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-muted-foreground">Bonus Balance</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-neon-green">₹5,000</p>
        </div>
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">VIP Level</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold gradient-text-gold">Gold</p>
        </div>
      </div>

      {/* Apply Promo Code */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4">Apply Promo Code</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="flex-1 h-10 px-4 rounded-lg bg-muted border border-border text-sm uppercase"
          />
          <Button onClick={applyPromoCode} disabled={!promoCode.trim()}>
            Apply
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {promoCodes.map((promo) => (
            <button
              key={promo.code}
              onClick={() => copyCode(promo.code)}
              className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <span className="font-mono font-medium">{promo.code}</span>
              <Copy className="w-3 h-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Bonuses List */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">My Bonuses</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {["all", "active", "available", "claimed", "expired"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize whitespace-nowrap"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredBonuses.map((bonus) => (
            <div
              key={bonus.id}
              className={`p-4 rounded-xl border ${getStatusColor(bonus.status)} ${
                bonus.status === "expired" ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                    bonus.status === "expired" ? "bg-muted" : "bg-primary/20"
                  }`}>
                    {getTypeIcon(bonus.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{bonus.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(bonus.status)}`}>
                        {bonus.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{bonus.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires: {bonus.expiresAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold font-mono text-neon-green">
                    ₹{bonus.amount.toLocaleString()}
                  </p>
                  {bonus.wagering > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-1">
                        <span>Wagering: ₹{bonus.wageringProgress.toLocaleString()}/₹{bonus.wagering.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(bonus.wageringProgress / bonus.wagering) * 100} 
                        className="h-1.5 w-32"
                      />
                    </div>
                  )}
                  {bonus.status === "available" && (
                    <Button size="sm" className="mt-2">
                      Claim Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIP Banner */}
      <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-accent/10 to-orange-500/10 border-accent/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Upgrade to Platinum VIP</h3>
              <p className="text-sm text-muted-foreground">Unlock exclusive bonuses & higher limits</p>
            </div>
          </div>
          <Button variant="gold" className="w-full sm:w-auto gap-2">
            Learn More <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
