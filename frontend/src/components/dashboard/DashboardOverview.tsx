import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Gamepad2,
  Gift,
  Trophy,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Star,
} from "lucide-react";

const recentGames = [
  { name: "Aviator", result: "win", amount: 2500, time: "2 hours ago" },
  { name: "Teen Patti", result: "loss", amount: -500, time: "4 hours ago" },
  { name: "Lightning Roulette", result: "win", amount: 8500, time: "Yesterday" },
  { name: "Sweet Bonanza", result: "loss", amount: -1200, time: "Yesterday" },
];

const activeBets = [
  { game: "IPL - MI vs CSK", type: "MI Win", odds: "1.85", stake: 1000, status: "live" },
  { game: "Premier League", type: "Over 2.5 Goals", odds: "1.72", stake: 500, status: "pending" },
];

const favoriteGames = [
  { id: "aviator", name: "Aviator", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=150&fit=crop" },
  { id: "teen-patti-1", name: "Teen Patti", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=200&h=150&fit=crop" },
  { id: "roulette-1", name: "Roulette", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200&h=150&fit=crop" },
  { id: "cricket-1", name: "Cricket", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=200&h=150&fit=crop" },
];

interface DashboardOverviewProps {
  walletBalance: number;
}

export function DashboardOverview({ walletBalance }: DashboardOverviewProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome back, John! 👋</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Ready to play and win?</p>
          </div>
          <Link to="/games">
            <Button variant="neon" size="default" className="gap-2 w-full sm:w-auto">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Play Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <Link to="/deposit">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Balance</p>
          <p className="text-lg sm:text-2xl font-bold font-mono">₹{walletBalance.toLocaleString()}</p>
        </div>

        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-neon-green" />
            </div>
            <span className="text-xs text-neon-green">+15%</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Winnings</p>
          <p className="text-lg sm:text-2xl font-bold font-mono text-neon-green">₹85,200</p>
        </div>

        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-red/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-neon-red" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Bets</p>
          <p className="text-lg sm:text-2xl font-bold font-mono">₹65,800</p>
        </div>

        <div className="glass rounded-xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Win Rate</p>
          <p className="text-lg sm:text-2xl font-bold font-mono gradient-text-gold">62%</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Bets */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Active Bets</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {activeBets.map((bet, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  {bet.status === "live" && (
                    <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  )}
                  <div>
                    <p className="font-medium text-xs sm:text-sm">{bet.game}</p>
                    <p className="text-xs text-muted-foreground">{bet.type} @ {bet.odds}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium text-sm">₹{bet.stake}</p>
                  <p className="text-xs text-neon-green">
                    Win: ₹{(bet.stake * parseFloat(bet.odds)).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Recent Activity</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentGames.map((game, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                    game.result === "win" ? "bg-neon-green/20" : "bg-neon-red/20"
                  }`}>
                    {game.result === "win" 
                      ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-neon-green" />
                      : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-neon-red" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-xs sm:text-sm">{game.name}</p>
                    <p className="text-xs text-muted-foreground">{game.time}</p>
                  </div>
                </div>
                <span className={`font-mono font-medium text-sm ${
                  game.result === "win" ? "text-neon-green" : "text-neon-red"
                }`}>
                  {game.result === "win" ? "+" : ""}₹{Math.abs(game.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Favorite Games */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            Favorite Games
          </h2>
          <Link to="/games" className="text-sm text-primary hover:underline flex items-center gap-1">
            Browse <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {favoriteGames.map((game) => (
            <Link key={game.id} to={`/game/${game.id}`} className="group">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="font-semibold text-xs sm:text-sm">{game.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="glass rounded-xl p-4 sm:p-6 bg-gradient-to-r from-accent/10 to-orange-500/10 border-accent/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Weekend Bonus!</h3>
              <p className="text-sm text-muted-foreground">Get 50% extra on deposits</p>
            </div>
          </div>
          <Link to="/deposit" className="w-full sm:w-auto">
            <Button variant="gold" size="default" className="w-full sm:w-auto">Claim Now</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
