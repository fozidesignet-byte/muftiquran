import { useState, useEffect } from "react";
import TrackerSection from "./TrackerSection";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "video-tracker-data";

interface TrackerData {
  editedCells: boolean[];
  capturedCells: boolean[];
  paidCells: boolean[];
}

const VideoTracker = () => {
  const { toast } = useToast();
  
  const [editedCells, setEditedCells] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: TrackerData = JSON.parse(saved);
      return data.editedCells || Array(180).fill(false);
    }
    return Array(180).fill(false);
  });

  const [capturedCells, setCapturedCells] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: TrackerData = JSON.parse(saved);
      return data.capturedCells || Array(180).fill(false);
    }
    return Array(180).fill(false);
  });

  const [paidCells, setPaidCells] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: TrackerData = JSON.parse(saved);
      return data.paidCells || Array(180).fill(false);
    }
    return Array(180).fill(false);
  });

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    const data: TrackerData = { editedCells, capturedCells, paidCells };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [editedCells, capturedCells, paidCells]);

  const toggleEditedCell = (index: number) => {
    setEditedCells(prev => {
      const newCells = [...prev];
      newCells[index] = !newCells[index];
      return newCells;
    });
  };

  const toggleCapturedCell = (index: number) => {
    setCapturedCells(prev => {
      const newCells = [...prev];
      newCells[index] = !newCells[index];
      return newCells;
    });
  };

  const togglePaidCell = (index: number) => {
    setPaidCells(prev => {
      const newCells = [...prev];
      newCells[index] = !newCells[index];
      return newCells;
    });
  };

  const editedCount = editedCells.filter(Boolean).length;
  const capturedCount = capturedCells.filter(Boolean).length;
  const paidCount = paidCells.filter(Boolean).length;

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      setEditedCells(Array(180).fill(false));
      setCapturedCells(Array(180).fill(false));
      setPaidCells(Array(180).fill(false));
      toast({
        title: "Data Reset",
        description: "All tracking data has been cleared.",
      });
    }
  };

  const handleSave = () => {
    const data: TrackerData = { editedCells, capturedCells, paidCells };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toast({
      title: "Saved!",
      description: "Your progress has been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            📹 Video & Cassette Tracker
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Left-click to fill/unfill • Right-click on Captured section to toggle PAID status
        </p>
      </div>

      {/* Summary Stats */}
      <div className="max-w-[1600px] mx-auto mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-edited-header p-4 rounded text-center">
            <div className="text-3xl font-bold text-foreground">{editedCount}</div>
            <div className="text-sm font-medium text-foreground/80">Edited Videos</div>
          </div>
          <div className="bg-captured-header p-4 rounded text-center">
            <div className="text-3xl font-bold text-counter-text">{capturedCount}</div>
            <div className="text-sm font-medium text-counter-text/80">Captured Cassettes</div>
          </div>
          <div className="bg-card border border-border p-4 rounded text-center">
            <div className="text-3xl font-bold text-paid-text">{paidCount}</div>
            <div className="text-sm font-medium text-muted-foreground">Paid</div>
          </div>
        </div>
      </div>

      {/* Tracker Sections */}
      <div className="max-w-[1600px] mx-auto">
        <TrackerSection
          title="ኤዲት የተሰሩ (Edited Videos)"
          type="edited"
          cells={editedCells}
          onToggleCell={toggleEditedCell}
          count={editedCount}
        />

        <TrackerSection
          title="ካፕቸር የተደረጉ (Captured Cassettes)"
          type="captured"
          cells={capturedCells}
          paidCells={paidCells}
          onToggleCell={toggleCapturedCell}
          onTogglePaid={togglePaidCell}
          count={capturedCount}
          paidCount={paidCount}
        />
      </div>
    </div>
  );
};

export default VideoTracker;
