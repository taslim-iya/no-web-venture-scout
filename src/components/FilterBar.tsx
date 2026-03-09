import { SlidersHorizontal, LayoutGrid, List } from "lucide-react";

type SortOption = "rating" | "reviews" | "name" | "established";
export type ViewMode = "grid" | "table";

type FilterBarProps = {
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  total: number;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
  { value: "name", label: "Name A–Z" },
  { value: "established", label: "Established" },
];

export const FilterBar = ({ sort, onSortChange, total }: FilterBarProps) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="text-cyan font-mono font-semibold">{total}</span>{" "}
        businesses without a website
      </p>

      <div className="flex items-center gap-2">
        <SlidersHorizontal size={14} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground mr-1">Sort by:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sort === opt.value
                ? "bg-cyan text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
