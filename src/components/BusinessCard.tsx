import { useState } from "react";
import { Phone, MapPin, Star, Copy, Check, Globe, Calendar, Users, Mail, Loader2 } from "lucide-react";
import { Business } from "@/data/mockBusinesses";
import { findEmailForBusiness } from "@/lib/hunterApi";

type BusinessCardProps = {
  business: Business;
  index: number;
};

export const BusinessCard = ({ business, index }: BusinessCardProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(business.email ?? null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSearched, setEmailSearched] = useState(!!business.email);
  const [emailConfidence, setEmailConfidence] = useState<number | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleFindEmail = async () => {
    if (emailLoading || emailSearched) return;
    setEmailLoading(true);
    const result = await findEmailForBusiness(business.name, business.city, business.state);
    setEmail(result.email);
    setEmailConfidence(result.confidence ?? null);
    setEmailSearched(true);
    setEmailLoading(false);
  };

  const staggerClass = index < 6 ? `stagger-${Math.min(index + 1, 6)}` : "";

  const categoryColors: Record<string, string> = {
    "Auto Repair": "text-warning",
    Bakery: "text-pink-400",
    Plumber: "text-blue-400",
    "Hair Salon": "text-purple-400",
    "Cleaning Service": "text-green-400",
    Electrician: "text-yellow-400",
    Restaurant: "text-orange-400",
    Florist: "text-pink-300",
    Landscaping: "text-green-500",
    Contractor: "text-amber-500",
    "Pet Grooming": "text-cyan",
    "Dry Cleaning": "text-sky-400",
    Dentist: "text-teal-400",
    Lawyer: "text-indigo-400",
    Accountant: "text-violet-400",
  };

  const catColor = categoryColors[business.category] || "text-muted-foreground";

  return (
    <div
      className={`group relative bg-gradient-card border border-border hover:border-cyan/30 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up opacity-0 ${staggerClass}`}
      style={{ animationFillMode: "forwards" }}
    >
      {/* No website badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-destructive/15 border border-destructive/30 text-destructive rounded-full px-2.5 py-1 text-xs font-mono font-medium">
        <Globe size={10} />
        No Website
      </div>

      {/* Header */}
      <div className="pr-24 mb-4">
        <h3 className="font-semibold text-foreground text-base leading-tight mb-1.5 group-hover:text-cyan transition-colors">
          {business.name}
        </h3>
        <span className={`text-xs font-mono font-medium ${catColor}`}>
          {business.category}
        </span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={11}
              className={
                i < Math.floor(business.rating)
                  ? "text-warning fill-warning"
                  : "text-muted-foreground"
              }
            />
          ))}
        </div>
        <span className="text-xs font-mono text-foreground font-medium">
          {business.rating}
        </span>
        <span className="text-xs text-muted-foreground">
          ({business.reviewCount} reviews)
        </span>
      </div>

      {/* Info rows */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-start gap-2.5">
          <MapPin size={13} className="text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-xs text-muted-foreground leading-tight">
            {business.address}, {business.city}, {business.state}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Phone size={13} className="text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-foreground">
              {business.phone || "—"}
            </span>
          </div>
          {business.phone && (
            <button
              onClick={() => copyToClipboard(business.phone, "phone")}
              className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-cyan"
              title="Copy phone number"
            >
              {copied === "phone" ? (
                <Check size={12} className="text-success" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          )}
        </div>

        {/* Email row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Mail size={13} className="text-muted-foreground shrink-0" />
            {emailSearched ? (
              email ? (
                <span className="text-xs font-mono text-foreground truncate">
                  {email}
                  {emailConfidence != null && (
                    <span className="ml-1 text-muted-foreground">({emailConfidence}%)</span>
                  )}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">No email found</span>
              )
            ) : (
              <button
                onClick={handleFindEmail}
                disabled={emailLoading}
                className="text-xs font-medium text-cyan hover:underline disabled:opacity-60 flex items-center gap-1"
              >
                {emailLoading ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Find Email"
                )}
              </button>
            )}
          </div>
          {emailSearched && email && (
            <button
              onClick={() => copyToClipboard(email, "email")}
              className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-cyan shrink-0"
              title="Copy email"
            >
              {copied === "email" ? (
                <Check size={12} className="text-success" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        {business.yearEstablished && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={11} />
            <span className="text-xs font-mono">Est. {business.yearEstablished}</span>
          </div>
        )}
        {business.employees && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users size={11} />
            <span className="text-xs font-mono">{business.employees} emp</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() =>
          copyToClipboard(
            [
              business.name,
              `${business.address}, ${business.city}, ${business.state}`,
              business.phone,
              email,
            ]
              .filter(Boolean)
              .join("\n"),
            "all"
          )
        }
        className="mt-3 w-full h-8 rounded-lg border border-cyan/30 text-cyan text-xs font-medium hover:bg-cyan/10 transition-all flex items-center justify-center gap-1.5"
      >
        {copied === "all" ? (
          <>
            <Check size={12} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={12} />
            Copy Lead Info
          </>
        )}
      </button>
    </div>
  );
};
