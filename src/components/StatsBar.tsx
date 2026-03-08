import { Business } from "@/data/mockBusinesses";
import { TrendingUp, Star, Building2, Download } from "lucide-react";

type StatsBarProps = {
  businesses: Business[];
  onExport: () => void;
};

export const StatsBar = ({ businesses, onExport }: StatsBarProps) => {
  const avgRating =
    businesses.length > 0
      ? (
          businesses.reduce((acc, b) => acc + b.rating, 0) / businesses.length
        ).toFixed(1)
      : "—";

  const totalReviews = businesses.reduce((acc, b) => acc + b.reviewCount, 0);

  const categories = new Set(businesses.map((b) => b.category)).size;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-5 bg-secondary/50 border border-border rounded-xl">
      <div className="flex flex-wrap gap-6">
        <Stat
          icon={<Building2 size={14} className="text-cyan" />}
          label="Businesses Found"
          value={businesses.length.toString()}
          highlight
        />
        <Stat
          icon={<Star size={14} className="text-warning" />}
          label="Avg Rating"
          value={avgRating}
        />
        <Stat
          icon={<TrendingUp size={14} className="text-electric" />}
          label="Total Reviews"
          value={totalReviews.toLocaleString()}
        />
        <Stat
          icon={<Building2 size={14} className="text-purple-400" />}
          label="Categories"
          value={categories.toString()}
        />
      </div>

      <button
        onClick={onExport}
        disabled={businesses.length === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan/30 text-cyan text-sm font-medium hover:bg-cyan/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Download size={14} />
        Export CSV
      </button>
    </div>
  );
};

const Stat = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex items-center gap-2">
    {icon}
    <div>
      <p className="text-xs text-muted-foreground leading-none mb-0.5">{label}</p>
      <p
        className={`text-sm font-mono font-semibold leading-none ${
          highlight ? "text-cyan" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);
