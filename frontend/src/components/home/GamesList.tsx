import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/games/GameCard";
import { ChevronRight, Spade, Dices, Rocket, Video, Gamepad2, Target } from "lucide-react";

const gamesByCategory = {
  cards: {
    title: "Card Games",
    icon: Spade,
    color: "primary",
    games: [
      { id: "teen-patti-1", name: "Teen Patti Gold", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=300&fit=crop", category: "Card Games", players: 8234, minBet: 50, maxBet: 50000, rating: 4.8, isHot: true, provider: "Evolution" },
      { id: "poker-1", name: "Texas Hold'em", image: "https://images.unsplash.com/photo-1609743522653-52354461eb27?w=400&h=300&fit=crop", category: "Card Games", players: 5621, minBet: 100, maxBet: 100000, rating: 4.7, provider: "Pokerstars" },
      { id: "rummy-1", name: "Rummy Master", image: "https://images.unsplash.com/photo-1529480780361-e64a8e32a8a2?w=400&h=300&fit=crop", category: "Card Games", players: 4532, minBet: 25, maxBet: 25000, rating: 4.6, isNew: true, provider: "RummyCircle" },
      { id: "blackjack-1", name: "VIP Blackjack", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop", category: "Card Games", players: 3421, minBet: 500, maxBet: 200000, rating: 4.8, provider: "Pragmatic Play" },
      { id: "baccarat-1", name: "Speed Baccarat", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop", category: "Card Games", players: 2891, minBet: 200, maxBet: 150000, rating: 4.5, provider: "Evolution" },
      { id: "andar-bahar", name: "Andar Bahar", image: "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=400&h=300&fit=crop", category: "Card Games", players: 6123, minBet: 20, maxBet: 30000, rating: 4.7, isHot: true, provider: "Ezugi" },
      { id: "dragon-tiger", name: "Dragon Tiger", image: "https://images.unsplash.com/photo-1514820720301-4c4790309f46?w=400&h=300&fit=crop", category: "Card Games", players: 4521, minBet: 50, maxBet: 40000, rating: 4.4, provider: "Pragmatic Play" },
      { id: "three-card-poker", name: "3 Card Poker", image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=300&fit=crop", category: "Card Games", players: 2341, minBet: 100, maxBet: 75000, rating: 4.5, isNew: true, provider: "Playtech" },
    ]
  },
  casino: {
    title: "Casino Games",
    icon: Dices,
    color: "secondary",
    games: [
      { id: "roulette-1", name: "Lightning Roulette", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop", category: "Casino", players: 7823, minBet: 100, maxBet: 500000, rating: 4.9, isHot: true, provider: "Evolution" },
      { id: "slots-1", name: "Sweet Bonanza", image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=300&fit=crop", category: "Slots", players: 12453, minBet: 10, maxBet: 10000, rating: 4.7, isHot: true, provider: "Pragmatic Play" },
      { id: "slots-2", name: "Book of Dead", image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=300&fit=crop", category: "Slots", players: 8934, minBet: 20, maxBet: 20000, rating: 4.6, provider: "Play'n GO" },
      { id: "dice-1", name: "Sic Bo", image: "https://images.unsplash.com/photo-1629229509826-e08f14da7919?w=400&h=300&fit=crop", category: "Casino", players: 3421, minBet: 50, maxBet: 50000, rating: 4.4, provider: "Microgaming" },
      { id: "wheel-1", name: "Dream Catcher", image: "https://images.unsplash.com/photo-1563941433-b6eb9c6d2fa0?w=400&h=300&fit=crop", category: "Casino", players: 5632, minBet: 100, maxBet: 100000, rating: 4.8, isNew: true, provider: "Evolution" },
      { id: "craps-1", name: "Street Craps", image: "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=400&h=300&fit=crop", category: "Casino", players: 2134, minBet: 50, maxBet: 30000, rating: 4.3, provider: "Playtech" },
      { id: "mega-ball", name: "Mega Ball", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop", category: "Casino", players: 4521, minBet: 20, maxBet: 25000, rating: 4.6, provider: "Evolution" },
      { id: "slots-3", name: "Starburst", image: "https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?w=400&h=300&fit=crop", category: "Slots", players: 9823, minBet: 10, maxBet: 15000, rating: 4.5, provider: "NetEnt" },
    ]
  },
  crash: {
    title: "Crash Games",
    icon: Rocket,
    color: "neon-cyan",
    games: [
      { id: "aviator", name: "Aviator", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop", category: "Crash", players: 15234, minBet: 10, maxBet: 100000, rating: 4.9, isHot: true, provider: "Spribe" },
      { id: "spaceman", name: "Spaceman", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop", category: "Crash", players: 8923, minBet: 10, maxBet: 50000, rating: 4.7, provider: "Pragmatic Play" },
      { id: "jetx", name: "JetX", image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop", category: "Crash", players: 6234, minBet: 20, maxBet: 75000, rating: 4.6, isNew: true, provider: "SmartSoft" },
      { id: "plinko", name: "Plinko", image: "https://images.unsplash.com/photo-1611329857570-f02f340e7378?w=400&h=300&fit=crop", category: "Crash", players: 5432, minBet: 5, maxBet: 25000, rating: 4.5, provider: "Spribe" },
      { id: "dice-crash", name: "Dice", image: "https://images.unsplash.com/photo-1629229509826-e08f14da7919?w=400&h=300&fit=crop", category: "Crash", players: 4123, minBet: 10, maxBet: 30000, rating: 4.4, provider: "Spribe" },
      { id: "mines", name: "Mines", image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=300&fit=crop", category: "Crash", players: 7234, minBet: 10, maxBet: 50000, rating: 4.7, isHot: true, provider: "Spribe" },
    ]
  },
  liveCasino: {
    title: "Live Casino",
    icon: Video,
    color: "neon-red",
    games: [
      { id: "live-roulette", name: "Live Roulette", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop", category: "Live Casino", players: 6543, minBet: 100, maxBet: 500000, rating: 4.9, isHot: true, provider: "Evolution" },
      { id: "live-blackjack", name: "Live Blackjack VIP", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop", category: "Live Casino", players: 4321, minBet: 500, maxBet: 300000, rating: 4.8, provider: "Evolution" },
      { id: "live-baccarat", name: "Live Baccarat", image: "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=400&h=300&fit=crop", category: "Live Casino", players: 5123, minBet: 200, maxBet: 400000, rating: 4.7, provider: "Pragmatic Play" },
      { id: "crazy-time", name: "Crazy Time", image: "https://images.unsplash.com/photo-1563941433-b6eb9c6d2fa0?w=400&h=300&fit=crop", category: "Live Casino", players: 8923, minBet: 50, maxBet: 100000, rating: 4.9, isHot: true, provider: "Evolution" },
      { id: "monopoly-live", name: "Monopoly Live", image: "https://images.unsplash.com/photo-1610891015188-5369212db097?w=400&h=300&fit=crop", category: "Live Casino", players: 4532, minBet: 100, maxBet: 75000, rating: 4.8, isNew: true, provider: "Evolution" },
      { id: "teen-patti-live", name: "Teen Patti Live", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=300&fit=crop", category: "Live Casino", players: 7234, minBet: 50, maxBet: 80000, rating: 4.6, provider: "Ezugi" },
    ]
  },
  casual: {
    title: "Casual Games",
    icon: Gamepad2,
    color: "accent",
    games: [
      { id: "ludo-1", name: "Ludo King", image: "https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400&h=300&fit=crop", category: "Casual", players: 12453, minBet: 10, maxBet: 10000, rating: 4.7, isHot: true, provider: "KarnaliX" },
      { id: "carrom", name: "Carrom Master", image: "https://images.unsplash.com/photo-1610891015188-5369212db097?w=400&h=300&fit=crop", category: "Casual", players: 5623, minBet: 20, maxBet: 15000, rating: 4.5, provider: "KarnaliX" },
      { id: "pool-8ball", name: "8 Ball Pool", image: "https://images.unsplash.com/photo-1615722539220-13fe05917e12?w=400&h=300&fit=crop", category: "Casual", players: 8234, minBet: 25, maxBet: 20000, rating: 4.6, provider: "Miniclip" },
      { id: "chess", name: "Chess Pro", image: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=400&h=300&fit=crop", category: "Casual", players: 3421, minBet: 50, maxBet: 25000, rating: 4.8, isNew: true, provider: "KarnaliX" },
      { id: "snakes-ladders", name: "Snakes & Ladders", image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400&h=300&fit=crop", category: "Casual", players: 4532, minBet: 10, maxBet: 5000, rating: 4.3, provider: "KarnaliX" },
      { id: "fruit-ninja", name: "Fruit Slash", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop", category: "Casual", players: 6234, minBet: 5, maxBet: 3000, rating: 4.4, provider: "KarnaliX" },
    ]
  },
  sports: {
    title: "Sports Betting",
    icon: Target,
    color: "neon-green",
    games: [
      { id: "cricket-1", name: "IPL Betting", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop", category: "Sports", players: 18234, minBet: 100, maxBet: 1000000, rating: 4.8, isHot: true, provider: "KarnaliX Sports" },
      { id: "football-1", name: "Premier League", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop", category: "Sports", players: 12453, minBet: 100, maxBet: 500000, rating: 4.7, provider: "KarnaliX Sports" },
      { id: "basketball-1", name: "NBA Live", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop", category: "Sports", players: 8923, minBet: 100, maxBet: 300000, rating: 4.6, provider: "KarnaliX Sports" },
      { id: "tennis-1", name: "Grand Slam", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop", category: "Sports", players: 5632, minBet: 50, maxBet: 200000, rating: 4.5, isNew: true, provider: "KarnaliX Sports" },
      { id: "esports-1", name: "CS:GO Pro", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop", category: "eSports", players: 9234, minBet: 50, maxBet: 150000, rating: 4.7, isHot: true, provider: "KarnaliX Sports" },
      { id: "kabaddi-1", name: "Pro Kabaddi", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop", category: "Sports", players: 4532, minBet: 50, maxBet: 100000, rating: 4.4, provider: "KarnaliX Sports" },
    ]
  }
};

interface GamesListProps {
  category: keyof typeof gamesByCategory;
  showAll?: boolean;
}

export function GamesList({ category, showAll = false }: GamesListProps) {
  const data = gamesByCategory[category];
  const Icon = data.icon;
  const displayGames = showAll ? data.games : data.games.slice(0, 8);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${data.color}/20 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${data.color}`} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">{data.title}</h2>
          </div>
          {!showAll && (
            <Link to={`/games/${category}`}>
              <Button variant="ghost" className="gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {displayGames.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>

        {!showAll && data.games.length > 8 && (
          <div className="mt-6 text-center">
            <Link to={`/games/${category}`}>
              <Button variant="outline" size="lg" className="gap-2">
                More {data.title} <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function AllGameCategories() {
  return (
    <>
      <GamesList category="cards" />
      <GamesList category="casino" />
      <GamesList category="crash" />
      <GamesList category="liveCasino" />
      <GamesList category="casual" />
      <GamesList category="sports" />
    </>
  );
}
