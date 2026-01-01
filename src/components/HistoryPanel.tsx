import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, History } from "lucide-react";

interface HistoryEntry {
  id: string;
  cell_index: number;
  section: string;
  action: string;
  changed_by_email: string;
  changed_at: string;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClose: () => void;
}

const HistoryPanel = ({ history, onClose }: HistoryPanelProps) => {
  const getActionColor = (action: string) => {
    if (action.includes("filled") || action.includes("marked")) return "text-green-600";
    if (action.includes("unfilled") || action.includes("unmarked")) return "text-red-600";
    return "text-foreground";
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case "edited": return "Edited";
      case "captured": return "Captured";
      case "re_edited": return "Re-Edit";
      case "re_captured": return "Re-Capture";
      case "edited_paid": return "Edited Paid";
      case "captured_paid": return "Captured Paid";
      default: return section;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <h2 className="font-semibold">Change History</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="p-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No changes recorded yet
            </p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="bg-muted/50 p-3 rounded-md text-sm space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Cell #{entry.cell_index + 1}
                  </span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                    {getSectionLabel(entry.section)}
                  </span>
                </div>
                <p className={getActionColor(entry.action)}>{entry.action}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.changed_by_email} •{" "}
                  {new Date(entry.changed_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HistoryPanel;
