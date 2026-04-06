import { useState, useRef, useEffect } from "react";
import { Sparkles, Download, Copy, Palette, Type, Eye, Users, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getSavedLeads, SavedLead } from "@/lib/savedLeadsApi";
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
  heroText: string;
  ctaText: string;
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
  "Pet Grooming": ["Dog Grooming", "Cat Grooming", "Nail Trimming", "Bathing", "Styling"],
  Bakery: ["Fresh Bread", "Cakes", "Pastries", "Custom Orders", "Catering"],
  Florist: ["Bouquets", "Wedding Flowers", "Funeral Flowers", "Subscriptions", "Events"],
  "Dry Cleaning": ["Suits", "Dresses", "Curtains", "Alterations", "Express Service"],
  Default: ["Consultation", "Premium Service", "Express Service", "Custom Solutions", "Support"],
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
  heroText: "",
  ctaText: "Get a Free Quote",
};

export default function MockBuilder() {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<MockConfig>(defaultConfig);
  const [showPreview, setShowPreview] = useState(false);
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<string>("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiKey, setAiKey] = useState(() => localStorage.getItem("vs-openai-key") || "");

  useEffect(() => {
    getSavedLeads().then(data => setLeads(data || []));
  }, []);

  const update = (field: keyof MockConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const loadFromLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    setSelectedLead(leadId);
    setConfig(prev => ({
      ...prev,
      businessName: lead.name,
      category: lead.category || prev.category,
      phone: lead.phone || "",
      email: lead.email || "",
      address: `${lead.address || ""}, ${lead.city}${lead.state ? ", " + lead.state : ""}`.replace(/^, /, ""),
      services: CATEGORY_SERVICES[lead.category] || CATEGORY_SERVICES.Default,
      tagline: "",
      heroText: "",
    }));
    toast({ title: `Loaded ${lead.name}` });
  };

  const generateWithAI = async () => {
    if (!config.businessName.trim()) {
      toast({ title: "Enter a business name first", variant: "destructive" });
      return;
    }
    if (!aiKey) {
      toast({ title: "Add your OpenAI API key below", variant: "destructive" });
      return;
    }

    setAiGenerating(true);
    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openai",
          apiKey: aiKey,
          model: "gpt-4o-mini",
          systemPrompt: "You generate website content for small businesses. Return valid JSON only, no markdown.",
          messages: [{
            role: "user",
            content: `Generate website content for "${config.businessName}" (${config.category}) in ${config.address || "the local area"}.

Return JSON:
{
  "tagline": "compelling 5-8 word tagline",
  "heroText": "one compelling sentence for the hero section",
  "ctaText": "call to action button text (3-5 words)",
  "services": ["service1", "service2", "service3", "service4", "service5", "service6"],
  "accentColor": "one of: #2563EB, #059669, #EA580C, #7C3AED, #E11D48, #0D9488, #D97706, #4F46E5"
}`
          }],
        }),
      });

      const data = await resp.json();
      if (data.content) {
        const cleaned = data.content.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        setConfig(prev => ({
          ...prev,
          tagline: parsed.tagline || prev.tagline,
          heroText: parsed.heroText || prev.heroText,
          ctaText: parsed.ctaText || prev.ctaText,
          services: parsed.services?.length ? parsed.services : prev.services,
          accentColor: ACCENT_COLORS.find(c => c.value === parsed.accentColor)?.value || prev.accentColor,
        }));
        toast({ title: "AI content generated!" });
      }
    } catch (err: any) {
      toast({ title: "AI generation failed", description: err.message, variant: "destructive" });
    }
    setAiGenerating(false);
  };

  const saveApiKey = (key: string) => {
    setAiKey(key);
    localStorage.setItem("vs-openai-key", key);
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
      const defaults: Record<string, string> = {
        Restaurant: `${config.businessName} — Unforgettable Dining`,
        Plumber: `${config.businessName} — Trusted Local Plumbing`,
        Electrician: `${config.businessName} — Certified Electrical Experts`,
        Default: `${config.businessName} — Quality You Can Trust`,
      };
      update("tagline", defaults[config.category] || defaults.Default);
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
            <p className="text-muted-foreground mt-1">Create professional website previews for outreach</p>
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
            {/* Load from saved leads */}
            {leads.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3"><Users className="w-4 h-4" /> Load from Saved Leads</h2>
                <select
                  value={selectedLead}
                  onChange={e => loadFromLead(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select a business...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} — {l.category}, {l.city}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Type className="w-4 h-4" /> Business Details</h2>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Business Name *</label>
                <input value={config.businessName} onChange={e => update("businessName", e.target.value)} placeholder="e.g. Marco's Italian Kitchen" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tagline</label>
                <input value={config.tagline} onChange={e => update("tagline", e.target.value)} placeholder="AI will generate if empty" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <select value={config.category} onChange={e => { update("category", e.target.value); update("services", CATEGORY_SERVICES[e.target.value] || CATEGORY_SERVICES.Default); }} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
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

            {/* AI Generation */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Wand2 className="w-4 h-4" /> AI Content</h2>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">OpenAI API Key</label>
                <input value={aiKey} onChange={e => saveApiKey(e.target.value)} type="password" placeholder="sk-..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <p className="text-xs text-muted-foreground mt-1">Saved locally. Used for tagline, services & copy.</p>
              </div>
              <button onClick={generateWithAI} disabled={aiGenerating || !config.businessName} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-50 text-sm font-medium">
                {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate with AI</>}
              </button>
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
              <Eye className="w-4 h-4" /> Generate Preview
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            {!showPreview ? (
              <div className="bg-card border border-border rounded-xl flex items-center justify-center min-h-[600px]">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Fill in the details and click Generate</p>
                  <p className="text-sm mt-1">Or select a saved lead to auto-fill</p>
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
                      {config.heroText || `Professional ${config.category.toLowerCase()} services in ${config.address ? config.address.split(",").pop()?.trim() : "your area"}. Quality you can trust.`}
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                      <span style={{ background: config.style === "minimal" ? accent : "#FFF", color: config.style === "minimal" ? "#FFF" : accent, padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>{config.ctaText || "Get a Free Quote"}</span>
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

                  {/* Testimonial */}
                  <div style={{ padding: "40px 32px", backgroundColor: "#F9FAFB" }}>
                    <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
                      <div style={{ fontSize: 32, color: accent, marginBottom: 12 }}>"</div>
                      <p style={{ fontSize: 16, color: "#333", fontStyle: "italic", lineHeight: 1.7, margin: "0 0 16px" }}>
                        Absolutely brilliant service. Professional, reliable, and great value. Wouldn't go anywhere else.
                      </p>
                      <p style={{ fontSize: 13, color: "#999" }}>— Satisfied Customer</p>
                    </div>
                  </div>

                  {/* CTA bar */}
                  <div style={{ background: accent, padding: "32px", textAlign: "center" }}>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: "#FFF", margin: "0 0 8px" }}>Ready to get started?</h3>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "0 0 16px" }}>
                      {config.phone && `Call ${config.phone} or `}get in touch today.
                    </p>
                    <span style={{ background: "#FFF", color: accent, padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Contact Us</span>
                  </div>

                  {/* Footer */}
                  <div style={{ backgroundColor: "#111", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#999", fontSize: 12 }}>© 2026 {config.businessName}. All rights reserved.</span>
                    <div style={{ color: "#999", fontSize: 12, display: "flex", gap: 16 }}>
                      {config.email && <span>{config.email}</span>}
                      {config.phone && <span>{config.phone}</span>}
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
