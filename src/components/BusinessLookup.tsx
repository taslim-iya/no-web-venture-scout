import { useState } from "react";
import { Search, Loader2, Globe, AlertTriangle, Star, MapPin, Phone, Mail, Copy, Check, ExternalLink, WifiOff, Lightbulb } from "lucide-react";
import { Business } from "@/data/mockBusinesses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const BusinessLookup = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Business | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setSearched(true);
    setResult(null);

    const { data, error } = await supabase.functions.invoke("lookup-business", {
      body: { query: query.trim() },
    });

    setIsLoading(false);

    if (error || data?.error) {
      toast({
        title: "Lookup failed",
        description: error?.message || data?.error || "Could not find business",
        variant: "destructive",
      });
      return;
    }

    if (data?.business) {
      setResult(data.business as Business);
    } else {
      toast({ title: "No business found", description: "Try a different name or domain." });
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const isPoor = result?.websiteQuality === "poor";
  const isNone = result && !result.hasWebsite;

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleLookup} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Enter business name or domain (e.g. joes-pizza.com)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-all font-mono text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="h-12 px-6 bg-cyan text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all shadow-glow disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search size={16} />
              Lookup
            </>
          )}
        </button>
      </form>

      {/* Result card */}
      {isLoading && (
        <div className="bg-gradient-card border border-border rounded-xl p-6 space-y-3">
          <div className="skeleton-shimmer h-6 w-1/2 rounded" />
          <div className="skeleton-shimmer h-4 w-1/3 rounded" />
          <div className="skeleton-shimmer h-4 w-full rounded" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-20 w-full rounded-lg mt-2" />
        </div>
      )}

      {!isLoading && result && (
        <div className="bg-gradient-card border border-border rounded-xl p-6 space-y-5 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-1">{result.name}</h3>
              <span className="text-xs font-mono font-medium text-cyan">{result.category}</span>
            </div>
            {isNone ? (
              <div className="flex items-center gap-1.5 bg-destructive/15 border border-destructive/30 text-destructive rounded-full px-2.5 py-1 text-xs font-mono font-medium">
                <Globe size={10} />
                No Website
              </div>
            ) : isPoor ? (
              <div className="flex items-center gap-1.5 bg-warning/15 border border-warning/30 text-warning rounded-full px-2.5 py-1 text-xs font-mono font-medium">
                <AlertTriangle size={10} />
                Poor Site
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-success/15 border border-success/30 text-success rounded-full px-2.5 py-1 text-xs font-mono font-medium">
                <Globe size={10} />
                Site OK
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5">
              <Star size={13} className="text-warning fill-warning shrink-0" />
              <span className="text-sm font-mono text-foreground">{result.rating} <span className="text-muted-foreground">({result.reviewCount} reviews)</span></span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={13} className="text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{result.address}, {result.city}, {result.state}</span>
            </div>
            {result.phone && (
              <div className="flex items-center gap-2.5">
                <Phone size={13} className="text-muted-foreground shrink-0" />
                <span className="text-sm font-mono text-foreground">{result.phone}</span>
                <button onClick={() => copy(result.phone, "phone")} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-cyan">
                  {copied === "phone" ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                </button>
              </div>
            )}
            {result.email && (
              <div className="flex items-center gap-2.5">
                <Mail size={13} className="text-muted-foreground shrink-0" />
                <span className="text-sm font-mono text-foreground">{result.email}</span>
                <button onClick={() => copy(result.email!, "email")} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-cyan">
                  {copied === "email" ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                </button>
              </div>
            )}
            {result.websiteUrl && (
              <div className="flex items-center gap-2.5 col-span-full">
                <Globe size={13} className="text-muted-foreground shrink-0" />
                <a href={result.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-muted-foreground hover:text-cyan flex items-center gap-1">
                  {result.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>

          {/* Website issues */}
          {isPoor && result.websiteIssues && result.websiteIssues.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.websiteIssues.map((issue) => (
                <span key={issue} className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-warning/10 text-warning border border-warning/20">
                  {issue}
                </span>
              ))}
              {result.websiteScore !== null && result.websiteScore !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-destructive/10 text-destructive border border-destructive/20">
                  Score {result.websiteScore}/100
                </span>
              )}
            </div>
          )}

          {/* Analysis & Recommendations */}
          {result.websiteAnalysis && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  {isPoor || isNone ? <WifiOff size={12} className="text-destructive" /> : null}
                  Analysis
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.websiteAnalysis}</p>
              </div>

              {result.websiteRecommendations && result.websiteRecommendations.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb size={12} className="text-cyan" />
                    Recommendations
                  </h4>
                  <ul className="space-y-1.5">
                    {result.websiteRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-cyan font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!isLoading && searched && !result && (
        <p className="text-sm text-muted-foreground text-center py-4 font-mono">No business found. Try a different name or domain.</p>
      )}
    </div>
  );
};
