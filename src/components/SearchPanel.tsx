import { useState } from "react";
import { Search, MapPin, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, MOCK_CITIES } from "@/data/mockBusinesses";

type SearchPanelProps = {
  onSearch: (city: string, category: string) => void;
  isLoading: boolean;
};

export const SearchPanel = ({ onSearch, isLoading }: SearchPanelProps) => {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(city, category);
  };

  const filteredCities = MOCK_CITIES.filter((c) =>
    c.toLowerCase().includes(city.toLowerCase())
  );

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row gap-3 w-full"
    >
      {/* City input */}
      <div className="relative flex-1">
        <MapPin
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan"
          size={16}
        />
        <input
          type="text"
          placeholder="Enter city (e.g. Austin, TX)"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setShowCitySuggestions(true);
          }}
          onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
          onFocus={() => setShowCitySuggestions(true)}
          className="w-full h-12 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-all font-mono text-sm"
        />
        {showCitySuggestions && city && filteredCities.length > 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-card overflow-hidden">
            {filteredCities.map((c) => (
              <button
                key={c}
                type="button"
                onMouseDown={() => {
                  setCity(c);
                  setShowCitySuggestions(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary text-foreground transition-colors font-mono flex items-center gap-2"
              >
                <MapPin size={12} className="text-cyan" />
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category select */}
      <div className="relative w-full md:w-56">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-12 pl-4 pr-10 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-all appearance-none text-sm cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-card">
              {cat}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          size={16}
        />
      </div>

      {/* Search button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 px-8 bg-cyan text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all shadow-glow disabled:opacity-50 flex items-center gap-2 min-w-[140px]"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Zap size={16} />
            Find Leads
          </>
        )}
      </Button>
    </form>
  );
};
