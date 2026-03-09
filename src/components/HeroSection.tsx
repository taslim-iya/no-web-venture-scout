import heroBg from "@/assets/hero-bg.jpg";
import { Globe, Search, Zap } from "lucide-react";
import { SearchPanel } from "./SearchPanel";
import { SearchMode } from "@/data/mockBusinesses";

type HeroSectionProps = {
  onSearch: (city: string, category: string, mode: SearchMode) => void;
  isLoading: boolean;
};

export const HeroSection = ({ onSearch, isLoading }: HeroSectionProps) => {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(to bottom, hsl(222 47% 6% / 0.5), hsl(222 47% 6%)), url(${heroBg}) center/cover no-repeat`,
      }}
    >
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 px-6 py-12 md:py-16 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-xs font-mono mb-6">
          <Zap size={12} />
          Lead Intelligence Tool
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight tracking-tight">
          Find businesses{" "}
          <span className="text-cyan relative">
            missing online
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-cyan rounded-full opacity-60" />
          </span>
        </h1>

        <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
          Discover local businesses with no website — or a broken, slow one. Your next web design clients are waiting.
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-8 mb-8">
          {[
            { icon: <Globe size={14} />, value: "10,000+", label: "Businesses tracked" },
            { icon: <Search size={14} />, value: "50+ cities", label: "Coverage" },
            { icon: <Zap size={14} />, value: "Instant", label: "Results" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-cyan text-sm font-mono font-semibold mb-0.5">
                {s.icon}
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search form */}
        <SearchPanel onSearch={onSearch} isLoading={isLoading} />
      </div>
    </div>
  );
};
