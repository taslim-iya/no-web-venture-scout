import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Business } from "@/data/mockBusinesses";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  onImport: (businesses: Business[], fileName: string) => void;
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export const CsvUpload = ({ onImport }: Props) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast({ title: "Empty CSV", description: "The file has no data rows.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

      // Map common header names
      const colMap: Record<string, number> = {};
      const aliases: Record<string, string[]> = {
        name: ["name", "businessname", "business", "company", "companyname"],
        category: ["category", "type", "industry", "businesstype"],
        address: ["address", "streetaddress", "street"],
        city: ["city", "town"],
        state: ["state", "st", "region", "province"],
        phone: ["phone", "phonenumber", "tel", "telephone"],
        email: ["email", "emailaddress", "mail"],
        rating: ["rating", "stars", "score"],
        reviews: ["reviews", "reviewcount", "totalreviews", "numreviews"],
        website: ["website", "url", "websiteurl", "site"],
      };

      for (const [field, names] of Object.entries(aliases)) {
        const idx = headers.findIndex((h) => names.includes(h));
        if (idx !== -1) colMap[field] = idx;
      }

      if (colMap.name === undefined) {
        toast({ title: "Missing 'Name' column", description: "CSV must have a Name column.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const businesses: Business[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const name = cols[colMap.name] || "";
        if (!name) continue;

        businesses.push({
          id: `csv-${i}-${Date.now()}`,
          name,
          category: cols[colMap.category] || "Business",
          address: cols[colMap.address] || "",
          city: cols[colMap.city] || "",
          state: cols[colMap.state] || "",
          phone: cols[colMap.phone] || "",
          email: cols[colMap.email] || undefined,
          rating: parseFloat(cols[colMap.rating] || "0") || 0,
          reviewCount: parseInt(cols[colMap.reviews] || "0", 10) || 0,
          hasWebsite: !!(cols[colMap.website]),
          websiteUrl: cols[colMap.website] || null,
          websiteQuality: cols[colMap.website] ? undefined : "none",
        });
      }

      if (businesses.length === 0) {
        toast({ title: "No valid rows", description: "Could not parse any businesses from the CSV.", variant: "destructive" });
      } else {
        onImport(businesses, file.name);
        toast({ title: `Imported ${businesses.length} businesses`, description: file.name });
      }
    } catch (err) {
      toast({ title: "Failed to parse CSV", description: String(err), variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-cyan hover:border-cyan/30 text-sm font-medium transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        Upload CSV
      </button>
    </>
  );
};
