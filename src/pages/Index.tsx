import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { BusinessCard } from "@/components/BusinessCard";
import { StatsBar } from "@/components/StatsBar";
import { FilterBar } from "@/components/FilterBar";
import { EmptyState } from "@/components/EmptyState";
import { Business, searchBusinesses } from "@/data/mockBusinesses";

type SortOption = "rating" | "reviews" | "name" | "established";

const sortBusinesses = (businesses: Business[], sort: SortOption): Business[] => {
  const sorted = [...businesses];
  switch (sort) {
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "reviews":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "established":
      return sorted.sort(
        (a, b) => (a.yearEstablished ?? 9999) - (b.yearEstablished ?? 9999)
      );
    default:
      return sorted;
  }
};

const exportCSV = (businesses: Business[]) => {
  const headers = ["Name", "Category", "Address", "City", "State", "Phone", "Rating", "Reviews", "Est. Year"];
  const rows = businesses.map((b) => [
    b.name,
    b.category,
    b.address,
    b.city,
    b.state,
    b.phone,
    b.rating,
    b.reviewCount,
    b.yearEstablished ?? "",
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "no-website-businesses.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const Index = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sort, setSort] = useState<SortOption>("rating");

  const handleSearch = (city: string, category: string) => {
    setIsLoading(true);
    setHasSearched(true);

    // Simulate async scan
    setTimeout(() => {
      const results = searchBusinesses(city, category);
      setBusinesses(results);
      setIsLoading(false);
    }, 1200);
  };

  const sorted = sortBusinesses(businesses, sort);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-cyan flex items-center justify-center">
            <span className="text-primary-foreground font-mono font-bold text-xs">N</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">
            no<span className="text-cyan">site</span>
            <span className="text-muted-foreground font-light">.finder</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Demo Mode
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero + Search */}
        <HeroSection onSearch={handleSearch} isLoading={isLoading} />

        {/* Results section */}
        {(hasSearched || businesses.length > 0) && (
          <div className="space-y-5">
            {/* Stats */}
            {!isLoading && businesses.length > 0 && (
              <StatsBar businesses={businesses} onExport={() => exportCSV(businesses)} />
            )}

            {/* Filter bar */}
            {!isLoading && businesses.length > 0 && (
              <FilterBar sort={sort} onSortChange={setSort} total={sorted.length} />
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-card border border-border rounded-xl p-5 space-y-3"
                  >
                    <div className="skeleton-shimmer h-5 w-3/4 rounded" />
                    <div className="skeleton-shimmer h-3 w-1/4 rounded" />
                    <div className="skeleton-shimmer h-3 w-full rounded" />
                    <div className="skeleton-shimmer h-3 w-2/3 rounded" />
                    <div className="skeleton-shimmer h-8 w-full rounded-lg mt-2" />
                  </div>
                ))}
              </div>
            )}

            {/* Results grid */}
            {!isLoading && businesses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((business, i) => (
                  <BusinessCard key={business.id} business={business} index={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && businesses.length === 0 && (
              <EmptyState searched={hasSearched} />
            )}
          </div>
        )}

        {/* Initial empty state */}
        {!hasSearched && <EmptyState searched={false} />}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          nositeﬁnder — demo data only · real implementation requires Google Places API
        </p>
      </footer>
    </div>
  );
};

export default Index;
