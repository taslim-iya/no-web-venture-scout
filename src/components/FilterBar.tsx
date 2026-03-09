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

export const FilterBar = ({ sort, onSortChange, total, view, onViewChange }: FilterBarProps) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="text-cyan font-mono font-semibold">{total}</span>{" "}
        businesses without a website
      </p>

      <div className="flex items-center gap-3">
        {/* Sort buttons */}
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

        {/* Divider */}
        <div className="w-px h-5 bg-border" />

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => onViewChange("grid")}
            title="Grid view"
            className={`p-1.5 rounded-md transition-all ${
              view === "grid"
                ? "bg-cyan text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => onViewChange("table")}
            title="Table view"
            className={`p-1.5 rounded-md transition-all ${
              view === "table"
                ? "bg-cyan text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
