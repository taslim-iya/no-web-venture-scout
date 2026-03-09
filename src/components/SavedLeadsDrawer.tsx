import { useState, useEffect } from "react";
import { X, Trash2, ChevronDown, BookmarkCheck, StickyNote } from "lucide-react";
import { getSavedLeads, updateLeadStatus, updateLeadNotes, deleteSavedLead, SavedLead, OutreachStatus } from "@/lib/savedLeadsApi";
import { useToast } from "@/components/ui/use-toast";

type SavedLeadsDrawerProps = {
  open: boolean;
  onClose: () => void;
  refreshKey: number;
};

const STATUS_CONFIG: Record<OutreachStatus, { label: string; color: string; bg: string }> = {
  new:         { label: "New",         color: "text-cyan",    bg: "bg-cyan/10 border-cyan/30" },
  contacted:   { label: "Contacted",   color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  in_progress: { label: "In Progress", color: "text-electric", bg: "bg-electric/10 border-electric/30" },
  closed:      { label: "Closed",      color: "text-success", bg: "bg-success/10 border-success/30" },
};

const STATUSES: OutreachStatus[] = ["new", "contacted", "in_progress", "closed"];

export const SavedLeadsDrawer = ({ open, onClose, refreshKey }: SavedLeadsDrawerProps) => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OutreachStatus | "all">("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getSavedLeads().then((data) => {
      setLeads(data);
      setLoading(false);
    });
  }, [open, refreshKey]);

  const handleStatusChange = async (lead: SavedLead, status: OutreachStatus) => {
    await updateLeadStatus(lead.id, status);
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status } : l));
  };

  const handleDelete = async (lead: SavedLead) => {
    await deleteSavedLead(lead.id);
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    toast({ title: "Lead removed", description: lead.name });
  };

  const handleSaveNotes = async (lead: SavedLead) => {
    await updateLeadNotes(lead.id, notesValue);
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, notes: notesValue } : l));
    setEditingNotes(null);
  };

  const filtered = filterStatus === "all" ? leads : leads.filter((l) => l.status === filterStatus);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-xl bg-background border-l border-border flex flex-col h-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <BookmarkCheck size={16} className="text-cyan" />
            <span className="font-bold text-foreground">Saved Leads</span>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {leads.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-5 py-3 border-b border-border shrink-0 overflow-x-auto">
          <button
            onClick={() => setFilterStatus("all")}
            className={`text-xs px-3 py-1 rounded-full border font-mono transition-all whitespace-nowrap ${filterStatus === "all" ? "bg-cyan/10 border-cyan/30 text-cyan" : "border-border text-muted-foreground hover:border-cyan/20"}`}
          >
            All ({leads.length})
          </button>
          {STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = leads.filter((l) => l.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1 rounded-full border font-mono transition-all whitespace-nowrap ${filterStatus === s ? `${cfg.bg} ${cfg.color}` : "border-border text-muted-foreground hover:border-cyan/20"}`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-20 rounded-xl" />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookmarkCheck size={32} className="text-muted-foreground mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">
                {leads.length === 0 ? "No saved leads yet" : "No leads match this filter"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 opacity-60">
                {leads.length === 0 ? "Click "Save Lead" on any result card" : "Try a different status filter"}
              </p>
            </div>
          )}

          {!loading && filtered.map((lead) => {
            const cfg = STATUS_CONFIG[lead.status];
            return (
              <div key={lead.id} className="bg-secondary/40 border border-border rounded-xl p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight truncate">{lead.name}</p>
                    <p className={`text-xs font-mono mt-0.5 ${cfg.color}`}>{lead.category}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(lead)}
                    className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Contact info */}
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{lead.address}, {lead.city}, {lead.state}</p>
                  {lead.phone && <p className="font-mono text-foreground">{lead.phone}</p>}
                  {lead.email && <p className="font-mono text-cyan">{lead.email}</p>}
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead, e.target.value as OutreachStatus)}
                      className={`w-full appearance-none text-xs font-mono px-3 py-1.5 rounded-lg border cursor-pointer pr-7 bg-background transition-colors ${cfg.bg} ${cfg.color}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-background text-foreground">
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={11} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${cfg.color}`} />
                  </div>

                  <button
                    onClick={() => {
                      setEditingNotes(editingNotes === lead.id ? null : lead.id);
                      setNotesValue(lead.notes ?? "");
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-secondary border border-border transition-colors"
                  >
                    <StickyNote size={11} />
                    Notes
                  </button>
                </div>

                {/* Notes editor */}
                {editingNotes === lead.id && (
                  <div className="space-y-2">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="Add notes about this lead…"
                      rows={3}
                      className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-cyan/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveNotes(lead)}
                        className="text-xs px-3 py-1 bg-cyan/10 border border-cyan/30 text-cyan rounded-lg hover:bg-cyan/20 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="text-xs px-3 py-1 border border-border text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Show existing notes (read mode) */}
                {lead.notes && editingNotes !== lead.id && (
                  <p className="text-xs text-muted-foreground bg-background border border-border rounded-lg px-3 py-2 italic">
                    {lead.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
