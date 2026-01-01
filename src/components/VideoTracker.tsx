import { useState, useEffect, useCallback } from "react";
import TrackerSection from "./TrackerSection";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, Download, LogOut, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, exportToExcel } from "@/lib/exportData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrackerData {
  editedCells: boolean[];
  capturedCells: boolean[];
  paidCells: boolean[];
}

const VideoTracker = () => {
  const { toast } = useToast();
  const { user, isAdmin, signOut } = useAuth();
  
  const [editedCells, setEditedCells] = useState<boolean[]>(Array(180).fill(false));
  const [capturedCells, setCapturedCells] = useState<boolean[]>(Array(180).fill(false));
  const [paidCells, setPaidCells] = useState<boolean[]>(Array(180).fill(false));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Drag selection state
  const [isSelectingEdited, setIsSelectingEdited] = useState(false);
  const [isSelectingCaptured, setIsSelectingCaptured] = useState(false);
  const [selectionMode, setSelectionMode] = useState<boolean | null>(null);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from("tracker_data")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setEditedCells(data.edited_cells || Array(180).fill(false));
          setCapturedCells(data.captured_cells || Array(180).fill(false));
          setPaidCells(data.paid_cells || Array(180).fill(false));
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load tracker data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Handle mouse up to stop selection
  useEffect(() => {
    const handleMouseUp = () => {
      setIsSelectingEdited(false);
      setIsSelectingCaptured(false);
      setSelectionMode(null);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleEditedMouseDown = useCallback((index: number) => {
    if (!isAdmin) return;
    setIsSelectingEdited(true);
    const newMode = !editedCells[index];
    setSelectionMode(newMode);
    setEditedCells(prev => {
      const newCells = [...prev];
      newCells[index] = newMode;
      return newCells;
    });
  }, [isAdmin, editedCells]);

  const handleEditedMouseEnter = useCallback((index: number) => {
    if (!isSelectingEdited || selectionMode === null) return;
    setEditedCells(prev => {
      const newCells = [...prev];
      newCells[index] = selectionMode;
      return newCells;
    });
  }, [isSelectingEdited, selectionMode]);

  const handleCapturedMouseDown = useCallback((index: number) => {
    if (!isAdmin) return;
    setIsSelectingCaptured(true);
    const newMode = !capturedCells[index];
    setSelectionMode(newMode);
    setCapturedCells(prev => {
      const newCells = [...prev];
      newCells[index] = newMode;
      return newCells;
    });
  }, [isAdmin, capturedCells]);

  const handleCapturedMouseEnter = useCallback((index: number) => {
    if (!isSelectingCaptured || selectionMode === null) return;
    setCapturedCells(prev => {
      const newCells = [...prev];
      newCells[index] = selectionMode;
      return newCells;
    });
  }, [isSelectingCaptured, selectionMode]);

  const togglePaidCell = useCallback((index: number) => {
    if (!isAdmin) return;
    setPaidCells(prev => {
      const newCells = [...prev];
      newCells[index] = !newCells[index];
      return newCells;
    });
  }, [isAdmin]);

  const editedCount = editedCells.filter(Boolean).length;
  const capturedCount = capturedCells.filter(Boolean).length;
  const paidCount = paidCells.filter(Boolean).length;

  const handleReset = async () => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to reset all data? This cannot be undone.")) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("tracker_data")
        .update({
          edited_cells: Array(180).fill(false),
          captured_cells: Array(180).fill(false),
          paid_cells: Array(180).fill(false),
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all rows

      if (error) throw error;

      setEditedCells(Array(180).fill(false));
      setCapturedCells(Array(180).fill(false));
      setPaidCells(Array(180).fill(false));
      
      toast({
        title: "Data Reset",
        description: "All tracking data has been cleared.",
      });
    } catch (error) {
      console.error("Error resetting data:", error);
      toast({
        title: "Error",
        description: "Failed to reset data.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("tracker_data")
        .update({
          edited_cells: editedCells,
          captured_cells: capturedCells,
          paid_cells: paidCells,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all rows

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your progress has been saved to the cloud.",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save data.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV({ editedCells, capturedCells, paidCells });
    toast({
      title: "Exported!",
      description: "Data exported as CSV file.",
    });
  };

  const handleExportExcel = () => {
    exportToExcel({ editedCells, capturedCells, paidCells });
    toast({
      title: "Exported!",
      description: "Data exported as Excel file.",
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading tracker data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              📹 Video & Cassette Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.email} • {isAdmin ? "Admin" : "Viewer"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {isAdmin && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSave}
                  className="gap-2"
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleReset}
                  className="gap-2"
                  disabled={saving}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </Button>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {isAdmin 
            ? "Click and drag to select multiple cells • Right-click on Captured section to toggle PAID status" 
            : "View only mode - contact admin for edit access"}
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
      <div className="max-w-[1600px] mx-auto select-none">
        <TrackerSection
          title="ኤዲት የተሰሩ (Edited Videos)"
          type="edited"
          cells={editedCells}
          onToggleCell={handleEditedMouseDown}
          count={editedCount}
          readOnly={!isAdmin}
          isSelecting={isSelectingEdited}
          onMouseDown={handleEditedMouseDown}
          onMouseEnter={handleEditedMouseEnter}
        />

        <TrackerSection
          title="ካፕቸር የተደረጉ (Captured Cassettes)"
          type="captured"
          cells={capturedCells}
          paidCells={paidCells}
          onToggleCell={handleCapturedMouseDown}
          onTogglePaid={togglePaidCell}
          count={capturedCount}
          paidCount={paidCount}
          readOnly={!isAdmin}
          isSelecting={isSelectingCaptured}
          onMouseDown={handleCapturedMouseDown}
          onMouseEnter={handleCapturedMouseEnter}
        />
      </div>
    </div>
  );
};

export default VideoTracker;
