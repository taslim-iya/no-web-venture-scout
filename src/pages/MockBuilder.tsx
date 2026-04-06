import { useState, useRef } from "react";
import { Sparkles, Download, Copy, Palette, Type, Image, RotateCcw, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";

interface MockConfig {
  businessName: string;
  tagline: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  services: string[];
  accentColor: string;
  style: "modern" | "classic" | "bold" | "minimal";
}

const ACCENT_COLORS = [
  { name: "Blue", value: "#2563EB" },
  { name: "Emerald", value: "#059669" },
  { name: "Orange", value: "#EA580C" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Rose", value: "#E11D48" },
  { name: "Teal", value: "#0D9488" },
  { name: "Amber", value: "#D97706" },
  { name: "Indigo", value: "#4F46E5" },
];

const CATEGORY_SERVICES: Record<string, string[]> = {
  Restaurant: ["Dine-In", "Takeaway", "Catering", "Private Events", "Delivery"],
  Plumber: ["Emergency Repairs", "Bathroom Fitting", "Boiler Installation", "Drain Cleaning", "Leak Detection"],
  Electrician: ["Rewiring", "Lighting", "Fuse Board Upgrades", "EV Charger Install", "PAT Testing"],
  "Hair Salon": ["Haircuts", "Colouring", "Styling", "Treatments", "Bridal Hair"],
  Dentist: ["Check-ups", "Teeth Whitening", "Invisalign", "Implants", "Emergency Dental"],
  Lawyer: ["Property Law", "Wills & Probate", "Family Law", "Business Law", "Litigation"],
  Accountant: ["Tax Returns", "Bookkeeping", "Payroll", "VAT", "Company Formation"],
  "Auto Repair": ["MOT Testing", "Servicing", "Diagnostics", "Tyres", "Bodywork"],
  Default: ["Service 1", "Service 2", "Service 3", "Service 4", "Service 5"],
};

const defaultConfig: MockConfig = {
  businessName: "",
  tagline: "",
  category: "Restaurant",
  phone: "",
  email: "",
  address: "",
  services: [],
  accentColor: "#2563EB",
  style: "modern",
};

function generateTagline(name: string, category: string): string {
  const taglines: Record<string, string[]> = {
    Restaurant: [`${name} — Unforgettable Dining`, `Fresh. Local. ${name}.`, `Where Every Meal Tells a Story`],
    Plumber: [`${name} — Trusted Local Plumbing`, `Fast, Reliable Plumbing Services`, `Your Pipes, Our Priority`],
    Electrician: [`${name} — Safe, Certified Electricians`, `Powering Homes & Businesses`, `Expert Electrical Solutions`],
    Default: [`${name} — Quality You Can Trust`, `Professional Services, Personal Touch`, `Your Local Experts`],
  };
  const options = taglines[category] || taglines.Default;
  return options[Math.floor(Math.random() * options.length)];
}

export default function MockBuilder() {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<MockConfig>(defaultConfig);
  const [showPreview, setShowPreview] = useState(false);

  const update = (field: keyof MockConfig, value: any) => {
    setConfig(prev => {
      const next = { ...prev, [field]: value };
      if (field === "category") {
        next.services = CATEGORY_SERVICES[value] || CATEGORY_SERVICES.Default;
      }
      if (field === "businessName" && !prev.tagline) {
        next.tagline = generateTagline(value, prev.category);
      }
      return next;
    });
  };

  const generate = () => {
    if (!config.businessName.trim()) {
      toast({ title: "Enter a business name", variant: "destructive" });
      return;
    }
    if (!config.services.length) {
      update("services", CATEGORY_SERVICES[config.category] || CATEGORY_SERVICES.Default);
    }
    if (!config.tagline) {
      update("tagline", generateTagline(config.businessName, config.category));
    }
    setShowPreview(true);
  };

  const downloadImage = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${config.businessName.replace(/\s+/g, "-").toLowerCase()}-website-mockup.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Mockup downloaded!" });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const copyToClipboard = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      canvas.toBlob(blob => {
        if (blob) {
          navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          toast({ title: "Copied to clipboard!" });
        }
      });
    } catch {
      toast({ title: "Copy failed — try download instead", variant: "destructive" });
    }
  };

  const accent = config.accentColor;
  const services = config.services.length ? config.services : (CATEGORY_SERVICES[config.category] || CATEGORY_SERVICES.Default);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Website Mockup Generator</h1>
            <p className="text-muted-foreground mt-1">Create professional website previews for your outreach</p>
          </div>
          {showPreview && (
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-muted transition">
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button onClick={downloadImage} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition">
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Panel */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Type className="w-4 h-4" /> Business Details</h2>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Business Name *</label>
                <input value={config.businessName} onChange={e => update("businessName", e.target.value)} placeholder="e.g. Marco's Italian Kitchen" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tagline</label>
                <input value={config.tagline} onChange={e => update("tagline", e.target.value)} placeholder="Auto-generated if empty" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <select value={config.category} onChange={e => update("category", e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  {Object.keys(CATEGORY_SERVICES).filter(k => k !== "Default").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                  <input value={config.phone} onChange={e => update("phone", e.target.value)} placeholder="+44 123 456" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input value={config.email} onChange={e => update("email", e.target.value)} placeholder="info@..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                <input value={config.address} onChange={e => update("address", e.target.value)} placeholder="123 High Street, London" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Palette className="w-4 h-4" /> Style</h2>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Accent Color</label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_COLORS.map(c => (
                    <button key={c.value} onClick={() => update("accentColor", c.value)} className={`w-8 h-8 rounded-full border-2 transition ${config.accentColor === c.value ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c.value }} title={c.name} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Layout Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["modern", "classic", "bold", "minimal"] as const).map(s => (
                    <button key={s} onClick={() => update("style", s)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition capitalize ${config.style === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={generate} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition font-medium">
              <Sparkles className="w-4 h-4" /> Generate Mockup
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            {!showPreview ? (
              <div className="bg-card border border-border rounded-xl flex items-center justify-center min-h-[600px]">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Fill in the details and click Generate</p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-[#E5E5E5] px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FDBB2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                    www.{config.businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.co.uk
                  </div>
                </div>

                {/* Website content */}
                <div ref={previewRef} style={{ fontFamily: config.style === "classic" ? "Georgia, serif" : "'Inter', system-ui, sans-serif" }}>
                  {/* Nav */}
                  <div style={{ backgroundColor: config.style === "bold" ? accent : "#FFFFFF", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: config.style === "bold" ? "none" : "1px solid #E5E7EB" }}>
                    <span style={{ fontWeight: 700, fontSize: 20, color: config.style === "bold" ? "#FFF" : "#111" }}>{config.businessName}</span>
                    <div style={{ display: "flex", gap: 24, fontSize: 14, color: config.style === "bold" ? "rgba(255,255,255,0.85)" : "#555" }}>
                      <span>Home</span><span>Services</span><span>About</span><span>Contact</span>
                    </div>
                  </div>

                  {/* Hero */}
                  <div style={{ background: config.style === "minimal" ? "#FAFAFA" : `linear-gradient(135deg, ${accent}, ${accent}CC)`, padding: config.style === "minimal" ? "60px 32px" : "80px 32px", textAlign: "center" }}>
                    <h1 style={{ fontSize: config.style === "classic" ? 36 : 42, fontWeight: config.style === "classic" ? 400 : 800, color: config.style === "minimal" ? "#111" : "#FFF", margin: "0 0 12px", lineHeight: 1.2 }}>
                      {config.tagline || config.businessName}
                    </h1>
                    <p style={{ fontSize: 16, color: config.style === "minimal" ? "#666" : "rgba(255,255,255,0.85)", margin: "0 0 28px", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
                      Professional {config.category.toLowerCase()} services in {config.address ? config.address.split(",").pop()?.trim() : "your area"}. Quality you can trust.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                      <span style={{ background: config.style === "minimal" ? accent : "#FFF", color: config.style === "minimal" ? "#FFF" : accent, padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Get a Free Quote</span>
                      <span style={{ background: "transparent", border: `2px solid ${config.style === "minimal" ? accent : "rgba(255,255,255,0.5)"}`, color: config.style === "minimal" ? accent : "#FFF", padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Call {config.phone || "Us"}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div style={{ padding: "48px 32px", backgroundColor: "#FFF" }}>
                    <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", color: "#111", margin: "0 0 8px" }}>Our Services</h2>
                    <p style={{ textAlign: "center", color: "#888", fontSize: 14, margin: "0 0 32px" }}>What we offer</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 700, margin: "0 auto" }}>
                      {services.slice(0, 6).map((s, i) => (
                        <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: accent, fontWeight: 700, fontSize: 18 }}>
                            {s.charAt(0)}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{s}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA bar */}
                  <div style={{ background: accent, padding: "32px", textAlign: "center" }}>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: "#FFF", margin: "0 0 8px" }}>Ready to get started?</h3>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "0 0 16px" }}>
                      {config.phone && `Call ${config.phone} or `}get in touch today for a free consultation.
                    </p>
                    <span style={{ background: "#FFF", color: accent, padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Contact Us</span>
                  </div>

                  {/* Footer */}
                  <div style={{ backgroundColor: "#111", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#999", fontSize: 12 }}>© 2026 {config.businessName}. All rights reserved.</span>
                    <div style={{ color: "#999", fontSize: 12, display: "flex", gap: 16 }}>
                      {config.email && <span>{config.email}</span>}
                      {config.phone && <span>{config.phone}</span>}
                      {config.address && <span>{config.address}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
