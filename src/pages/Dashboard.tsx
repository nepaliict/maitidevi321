import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton, whatsAppLinks } from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Gamepad2,
  Gift,
  Bell,
  User,
  Settings,
  History,
  Trophy,
  Star,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
  Zap
} from "lucide-react";

const recentGames = [
  { name: "Aviator", result: "win", amount: 2500, time: "2 hours ago" },
  { name: "Teen Patti", result: "loss", amount: -500, time: "4 hours ago" },
  { name: "Lightning Roulette", result: "win", amount: 8500, time: "Yesterday" },
  { name: "Sweet Bonanza", result: "loss", amount: -1200, time: "Yesterday" },
  { name: "Blackjack", result: "win", amount: 3200, time: "2 days ago" },
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Gamepad2 },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "history", label: "Bet History", icon: History },
    { id: "bonuses", label: "Bonuses", icon: Gift },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <main className="pt-28 pb-20 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="glass rounded-xl p-4 sticky top-28">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-primary-foreground">
                    JD
                  </div>
                  <div>
                    <p className="font-semibold">John Doe</p>
                    <p className="text-xs text-muted-foreground">VIP Member</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === item.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Welcome Banner */}
              <div className="glass rounded-xl p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Welcome back, John! 👋</h1>
                    <p className="text-muted-foreground">Ready to play and win?</p>
                  </div>
                  <Link to="/games">
                    <Button variant="neon" size="lg" className="gap-2">
                      <Gamepad2 className="w-5 h-5" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <Link to="/deposit">
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Wallet Balance</p>
                  <p className="text-2xl font-bold font-mono">₹12,450</p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-neon-green" />
                    </div>
                    <span className="text-xs text-neon-green">+15%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total Winnings</p>
                  <p className="text-2xl font-bold font-mono text-neon-green">₹85,200</p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-red/20 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-neon-red" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Total Bets</p>
                  <p className="text-2xl font-bold font-mono">₹65,800</p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                  <p className="text-2xl font-bold font-mono gradient-text-gold">62%</p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Active Bets */}
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Active Bets</h2>
                    <Link to="/bets" className="text-sm text-primary hover:underline">View All</Link>
                  </div>
                  <div className="space-y-3">
                    {activeBets.map((bet, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {bet.status === "live" && (
                            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{bet.game}</p>
                            <p className="text-xs text-muted-foreground">{bet.type} @ {bet.odds}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium">₹{bet.stake}</p>
                          <p className="text-xs text-neon-green">
                            Win: ₹{(bet.stake * parseFloat(bet.odds)).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activeBets.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No active bets</p>
                    )}
                  </div>
                </div>

                {/* Recent Games */}
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                    <Link to="/history" className="text-sm text-primary hover:underline">View All</Link>
                  </div>
                  <div className="space-y-3">
                    {recentGames.map((game, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            game.result === "win" ? "bg-neon-green/20" : "bg-neon-red/20"
                          }`}>
                            {game.result === "win" 
                              ? <ArrowUpRight className="w-4 h-4 text-neon-green" />
                              : <ArrowDownRight className="w-4 h-4 text-neon-red" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm">{game.name}</p>
                            <p className="text-xs text-muted-foreground">{game.time}</p>
                          </div>
                        </div>
                        <span className={`font-mono font-medium ${
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
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" />
                    Favorite Games
                  </h2>
                  <Link to="/games" className="text-sm text-primary hover:underline flex items-center gap-1">
                    Browse All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                          <p className="font-semibold text-sm">{game.name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Promo Banner */}
              <div className="glass rounded-xl p-6 bg-gradient-to-r from-accent/10 to-orange-500/10 border-accent/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
                      <Gift className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Weekend Bonus!</h3>
                      <p className="text-muted-foreground">Get 50% extra on deposits this weekend</p>
                    </div>
                  </div>
                  <Link to="/deposit">
                    <Button variant="gold" size="lg">Claim Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
