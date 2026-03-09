import { useState } from "react";
import { Star, Copy, Check, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Business } from "@/data/mockBusinesses";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortColumn = "name" | "category" | "rating" | "reviews" | "city" | "phone" | "established";
type SortDir = "asc" | "desc";

type Props = { businesses: Business[] };

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

export const BusinessTable = ({ businesses }: Props) => {
  const [sortCol, setSortCol] = useState<SortColumn>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [copied, setCopied] = useState<string | null>(null);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "name" || col === "category" || col === "city" ? "asc" : "desc");
    }
  };

  const sorted = [...businesses].sort((a, b) => {
    let av: string | number = "";
    let bv: string | number = "";
    switch (sortCol) {
      case "name": av = a.name; bv = b.name; break;
      case "category": av = a.category; bv = b.category; break;
      case "rating": av = a.rating; bv = b.rating; break;
      case "reviews": av = a.reviewCount; bv = b.reviewCount; break;
      case "city": av = a.city; bv = b.city; break;
      case "phone": av = a.phone; bv = b.phone; break;
      case "established": av = a.yearEstablished ?? 9999; bv = b.yearEstablished ?? 9999; break;
    }
    if (typeof av === "string") {
      return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    }
    return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const SortIcon = ({ col }: { col: SortColumn }) => {
    if (sortCol !== col) return <ChevronsUpDown size={12} className="text-muted-foreground/40 ml-1 inline" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-cyan ml-1 inline" />
      : <ChevronDown size={12} className="text-cyan ml-1 inline" />;
  };

  const th = (col: SortColumn, label: string) => (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap font-mono text-xs"
      onClick={() => handleSort(col)}
    >
      {label}<SortIcon col={col} />
    </TableHead>
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-gradient-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {th("name", "Business")}
            {th("category", "Category")}
            {th("city", "Location")}
            {th("rating", "Rating")}
            {th("reviews", "Reviews")}
            {th("phone", "Phone")}
            {th("established", "Est.")}
            <TableHead className="font-mono text-xs w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((b) => {
            const catColor = categoryColors[b.category] || "text-muted-foreground";
            return (
              <TableRow
                key={b.id}
                className="border-border hover:bg-secondary/40 transition-colors group"
              >
                {/* Business name */}
                <TableCell className="font-medium text-foreground text-sm group-hover:text-cyan transition-colors max-w-[180px] truncate">
                  {b.name}
                </TableCell>

                {/* Category */}
                <TableCell>
                  <span className={`text-xs font-mono font-medium ${catColor}`}>
                    {b.category}
                  </span>
                </TableCell>

                {/* Location */}
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {b.city}, {b.state}
                </TableCell>

                {/* Rating */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-warning fill-warning" />
                    <span className="text-xs font-mono text-foreground font-medium">{b.rating}</span>
                  </div>
                </TableCell>

                {/* Reviews */}
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {b.reviewCount.toLocaleString()}
                </TableCell>

                {/* Phone */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-foreground">{b.phone}</span>
                    <button
                      onClick={() => copy(b.phone, `phone-${b.id}`)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-secondary transition-all text-muted-foreground hover:text-cyan"
                      title="Copy phone"
                    >
                      {copied === `phone-${b.id}` ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                    </button>
                  </div>
                </TableCell>

                {/* Year established */}
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {b.yearEstablished ?? "—"}
                </TableCell>

                {/* Copy all */}
                <TableCell>
                  <button
                    onClick={() => copy(`${b.name}\n${b.address}, ${b.city}, ${b.state}\n${b.phone}`, `all-${b.id}`)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md border border-cyan/30 text-cyan hover:bg-cyan/10 transition-all"
                    title="Copy lead info"
                  >
                    {copied === `all-${b.id}` ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
