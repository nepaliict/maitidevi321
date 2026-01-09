import { 
  Spade, 
  Dices, 
  Trophy, 
  Video, 
  Gamepad2, 
  Target,
  Rocket,
  Ticket
} from "lucide-react";
import { CategoryCard } from "@/components/games/CategoryCard";

const categories = [
  {
    name: "Card Games",
    icon: Spade,
    href: "/games/cards",
    gameCount: 45,
    color: "cyan" as const,
  },
  {
    name: "Casino Games",
    icon: Dices,
    href: "/games/casino",
    gameCount: 120,
    color: "purple" as const,
  },
  {
    name: "Sports Betting",
    icon: Trophy,
    href: "/sports",
    gameCount: 50,
    color: "green" as const,
  },
  {
    name: "Live Casino",
    icon: Video,
    href: "/live-casino",
    gameCount: 35,
    color: "red" as const,
  },
  {
    name: "Casual Games",
    icon: Gamepad2,
    href: "/games/casual",
    gameCount: 80,
    color: "gold" as const,
  },
  {
    name: "Fantasy Sports",
    icon: Target,
    href: "/fantasy",
    gameCount: 25,
    color: "pink" as const,
  },
  {
    name: "Crash Games",
    icon: Rocket,
    href: "/games/crash",
    gameCount: 15,
    color: "cyan" as const,
  },
  {
    name: "Lottery & Jackpots",
    icon: Ticket,
    href: "/games/lottery",
    gameCount: 20,
    color: "gold" as const,
  },
];

export function GameCategories() {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Explore <span className="gradient-text">Game Categories</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From classic card games to thrilling live casino experiences. Find your perfect game.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
}
