import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GameCard } from "@/components/games/GameCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  LayoutList,
  Spade,
  Dices,
  Rocket,
  Video,
  Gamepad2,
  Target,
  ChevronDown
} from "lucide-react";

const allGames = [
  { id: "teen-patti-1", name: "Teen Patti Gold", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=300&fit=crop", category: "Card Games", players: 8234, minBet: 50, maxBet: 50000, rating: 4.8, isHot: true, provider: "Evolution" },
  { id: "poker-1", name: "Texas Hold'em", image: "https://images.unsplash.com/photo-1609743522653-52354461eb27?w=400&h=300&fit=crop", category: "Card Games", players: 5621, minBet: 100, maxBet: 100000, rating: 4.7, provider: "Pokerstars" },
  { id: "aviator", name: "Aviator", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop", category: "Crash", players: 15234, minBet: 10, maxBet: 100000, rating: 4.9, isHot: true, provider: "Spribe" },
  { id: "roulette-1", name: "Lightning Roulette", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop", category: "Casino", players: 7823, minBet: 100, maxBet: 500000, rating: 4.9, isHot: true, provider: "Evolution" },
  { id: "slots-1", name: "Sweet Bonanza", image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=300&fit=crop", category: "Slots", players: 12453, minBet: 10, maxBet: 10000, rating: 4.7, isHot: true, provider: "Pragmatic Play" },
  { id: "blackjack-1", name: "VIP Blackjack", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop", category: "Card Games", players: 3421, minBet: 500, maxBet: 200000, rating: 4.8, provider: "Pragmatic Play" },
  { id: "ludo-1", name: "Ludo King", image: "https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400&h=300&fit=crop", category: "Casual", players: 12453, minBet: 10, maxBet: 10000, rating: 4.7, isHot: true, provider: "KarnaliX" },
  { id: "cricket-1", name: "IPL Betting", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop", category: "Sports", players: 18234, minBet: 100, maxBet: 1000000, rating: 4.8, isHot: true, provider: "KarnaliX Sports" },
  { id: "rummy-1", name: "Rummy Master", image: "https://images.unsplash.com/photo-1529480780361-e64a8e32a8a2?w=400&h=300&fit=crop", category: "Card Games", players: 4532, minBet: 25, maxBet: 25000, rating: 4.6, isNew: true, provider: "RummyCircle" },
  { id: "spaceman", name: "Spaceman", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop", category: "Crash", players: 8923, minBet: 10, maxBet: 50000, rating: 4.7, provider: "Pragmatic Play" },
  { id: "crazy-time", name: "Crazy Time", image: "https://images.unsplash.com/photo-1563941433-b6eb9c6d2fa0?w=400&h=300&fit=crop", category: "Live Casino", players: 8923, minBet: 50, maxBet: 100000, rating: 4.9, isHot: true, provider: "Evolution" },
  { id: "pool-8ball", name: "8 Ball Pool", image: "https://images.unsplash.com/photo-1615722539220-13fe05917e12?w=400&h=300&fit=crop", category: "Casual", players: 8234, minBet: 25, maxBet: 20000, rating: 4.6, provider: "Miniclip" },
  { id: "baccarat-1", name: "Speed Baccarat", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop", category: "Card Games", players: 2891, minBet: 200, maxBet: 150000, rating: 4.5, provider: "Evolution" },
  { id: "football-1", name: "Premier League", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop", category: "Sports", players: 12453, minBet: 100, maxBet: 500000, rating: 4.7, provider: "KarnaliX Sports" },
  { id: "mines", name: "Mines", image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=300&fit=crop", category: "Crash", players: 7234, minBet: 10, maxBet: 50000, rating: 4.7, isHot: true, provider: "Spribe" },
  { id: "andar-bahar", name: "Andar Bahar", image: "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=400&h=300&fit=crop", category: "Card Games", players: 6123, minBet: 20, maxBet: 30000, rating: 4.7, isHot: true, provider: "Ezugi" },
];

const categories = [
  { id: "all", name: "All Games", icon: Grid3X3 },
  { id: "cards", name: "Card Games", icon: Spade },
  { id: "casino", name: "Casino", icon: Dices },
  { id: "crash", name: "Crash Games", icon: Rocket },
  { id: "live", name: "Live Casino", icon: Video },
  { id: "casual", name: "Casual", icon: Gamepad2 },
  { id: "sports", name: "Sports", icon: Target },
];

const providers = ["All Providers", "Evolution", "Pragmatic Play", "Spribe", "Ezugi", "NetEnt", "Microgaming"];

export default function Games() {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [selectedProvider, setSelectedProvider] = useState("All Providers");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      game.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesProvider = selectedProvider === "All Providers" || 
      game.provider === selectedProvider;
    return matchesSearch && matchesCategory && matchesProvider;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case "popular": return b.players - a.players;
      case "rating": return b.rating - a.rating;
      case "name": return a.name.localeCompare(b.name);
      case "minBet": return a.minBet - b.minBet;
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {selectedCategory === "all" ? "All Games" : categories.find(c => c.id === selectedCategory)?.name || "Games"}
            </h1>
            <p className="text-muted-foreground">
              Discover {sortedGames.length} exciting games to play and win
            </p>
          </div>

          {/* Filters Bar */}
          <div className="glass rounded-xl p-4 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  className="pl-10 h-12 bg-input border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      className="flex-shrink-0 gap-2"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Second Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                {/* Provider Filter */}
                <div className="relative">
                  <select
                    className="appearance-none bg-input border border-border rounded-lg px-4 py-2 pr-8 text-sm"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                  >
                    {providers.map((provider) => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    className="appearance-none bg-input border border-border rounded-lg px-4 py-2 pr-8 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                    <option value="name">A-Z</option>
                    <option value="minBet">Min Bet</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{sortedGames.length} games</span>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className={`grid gap-4 ${
            viewMode === "grid" 
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
              : "grid-cols-1 md:grid-cols-2"
          }`}>
            {sortedGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>

          {sortedGames.length === 0 && (
            <div className="text-center py-16">
              <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No games found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
