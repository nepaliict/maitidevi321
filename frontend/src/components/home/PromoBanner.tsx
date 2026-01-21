import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Gift, Percent, Users, Trophy } from "lucide-react";

interface PromoBannerProps {
  variant?: "welcome" | "referral" | "tournament" | "cashback";
}

export function PromoBanner({ variant = "welcome" }: PromoBannerProps) {
  const banners = {
    welcome: {
      icon: <Gift className="w-8 h-8" />,
      badge: "🎁 LIMITED OFFER",
      title: "Welcome Bonus",
      highlight: "200%",
      subtitle: "Up to ₹50,000",
      description: "Double your first deposit and start winning big!",
      cta: "Claim Now",
      href: "/signup",
      gradient: "from-primary via-secondary to-primary",
    },
    referral: {
      icon: <Users className="w-8 h-8" />,
      badge: "👥 REFER & EARN",
      title: "Invite Friends",
      highlight: "₹500",
      subtitle: "Per Referral",
      description: "Share your link and earn for every friend who joins!",
      cta: "Get Your Link",
      href: "/affiliate",
      gradient: "from-neon-green via-emerald-500 to-neon-green",
    },
    tournament: {
      icon: <Trophy className="w-8 h-8" />,
      badge: "🏆 WEEKLY EVENT",
      title: "Mega Tournament",
      highlight: "₹10 Lakh",
      subtitle: "Prize Pool",
      description: "Compete with the best and win massive rewards!",
      cta: "Join Now",
      href: "/tournaments",
      gradient: "from-accent via-orange-500 to-accent",
    },
    cashback: {
      icon: <Percent className="w-8 h-8" />,
      badge: "💰 EVERY WEEK",
      title: "Cashback Offer",
      highlight: "15%",
      subtitle: "Weekly Cashback",
      description: "Get money back on your losses every week!",
      cta: "Learn More",
      href: "/promotions",
      gradient: "from-neon-pink via-purple-500 to-neon-pink",
    },
  };

  const banner = banners[variant];

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${banner.gradient} p-[2px]`}>
      <div className="relative rounded-2xl bg-card overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
          }} />
        </div>

        {/* Content */}
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${banner.gradient} flex items-center justify-center text-white flex-shrink-0 animate-float`}>
            {banner.icon}
          </div>

          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-muted text-xs font-semibold mb-3">
              {banner.badge}
            </span>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              {banner.title}: <span className="gradient-text">{banner.highlight}</span> {banner.subtitle}
            </h3>
            <p className="text-muted-foreground">{banner.description}</p>
          </div>

          {/* CTA */}
          <Link to={banner.href}>
            <Button variant="gold" size="lg" className="flex-shrink-0">
              {banner.cta}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PromoBannerGrid() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          <PromoBanner variant="welcome" />
          <PromoBanner variant="referral" />
        </div>
      </div>
    </section>
  );
}
