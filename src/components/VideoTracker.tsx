import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TrackerSection from "./TrackerSection";
import CounterBoxes from "./CounterBoxes";
import CommentDialog from "./CommentDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, Download, LogOut, FileSpreadsheet, Settings } from "lucide-react";
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

interface Comment {
  id: string;
  cell_index: number;
  section: string;
  comment: string;
  created_by: string;
  created_by_email: string;
  created_at: string;
  updated_at: string;
}

const VideoTracker = () => {
  const { toast } = useToast();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Main cells
  const [editedCells, setEditedCells] = useState<boolean[]>(Array(180).fill(false));
  const [capturedCells, setCapturedCells] = useState<boolean[]>(Array(180).fill(false));
  const [paidCells, setPaidCells] = useState<boolean[]>(Array(180).fill(false));
  
  // Re-action and paid cells
  const [reEditedCells, setReEditedCells] = useState<boolean[]>(Array(180).fill(false));
  const [editedPaidCells, setEditedPaidCells] = useState<boolean[]>(Array(180).fill(false));
  const [reCapturedCells, setReCapturedCells] = useState<boolean[]>(Array(180).fill(false));
  
  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Dialog states
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedCellForComment, setSelectedCellForComment] = useState<{ index: number; section: string } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
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
        const [trackerResult, commentsResult] = await Promise.all([
          supabase.from("tracker_data").select("*").limit(1).maybeSingle(),
          supabase.from("cell_comments").select("*").order("created_at", { ascending: false }),
        ]);

        if (trackerResult.error) throw trackerResult.error;
        if (commentsResult.error) throw commentsResult.error;

        if (trackerResult.data) {
          setEditedCells(trackerResult.data.edited_cells || Array(180).fill(false));
          setCapturedCells(trackerResult.data.captured_cells || Array(180).fill(false));
          setPaidCells(trackerResult.data.paid_cells || Array(180).fill(false));
          setReEditedCells(trackerResult.data.re_edited_cells || Array(180).fill(false));
          setEditedPaidCells(trackerResult.data.edited_paid_cells || Array(180).fill(false));
          setReCapturedCells(trackerResult.data.re_captured_cells || Array(180).fill(false));
        }
        
        setComments(commentsResult.data || []);
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

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('tracker-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracker_data' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const data = payload.new as any;
            setEditedCells(data.edited_cells || Array(180).fill(false));
            setCapturedCells(data.captured_cells || Array(180).fill(false));
            setPaidCells(data.paid_cells || Array(180).fill(false));
            setReEditedCells(data.re_edited_cells || Array(180).fill(false));
            setEditedPaidCells(data.edited_paid_cells || Array(180).fill(false));
            setReCapturedCells(data.re_captured_cells || Array(180).fill(false));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cell_comments' },
        async () => {
          const { data } = await supabase
            .from("cell_comments")
            .select("*")
            .order("created_at", { ascending: false });
          if (data) setComments(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const toggleReEdited = useCallback((index: number) => {
    if (!isAdmin) return;
    setReEditedCells(prev => {
      const newCells = [...prev];
      newCells[index] = !newCells[index];
      return newCells;
    });
  }, [isAdmin]);

  const toggleEditedPaid = useCallback((index: number) => {
    if (!isAdmin) return;
    setEditedPaidCells(prev => {
      const newCells = [...prev];
      newCells[index] = !newCells[index];
      return newCells;
    });
  }, [isAdmin]);

  const toggleReCaptured = useCallback((index: number) => {
    if (!isAdmin) return;
    setReCapturedCells(prev => {
      const newCells = [...prev];
      newCells[index] = !newCells[index];
      return newCells;
    });
  }, [isAdmin]);

  const toggleCapturedPaid = useCallback((index: number) => {
    if (!isAdmin) return;
    setPaidCells(prev => {
      const newCells = [...prev];
      newCells[index] = !newCells[index];
      return newCells;
    });
  }, [isAdmin]);

  const openCommentDialog = useCallback((index: number, section: string) => {
    setSelectedCellForComment({ index, section });
    setCommentDialogOpen(true);
  }, []);

  const getExistingComment = useCallback(() => {
    if (!selectedCellForComment) return null;
    return comments.find(
      c => c.cell_index === selectedCellForComment.index && c.section === selectedCellForComment.section
    ) || null;
  }, [comments, selectedCellForComment]);

  const handleSaveComment = useCallback(async (comment: string) => {
    if (!selectedCellForComment || !user) return;
    try {
      await supabase.from("cell_comments").insert({
        cell_index: selectedCellForComment.index,
        section: selectedCellForComment.section,
        comment,
        created_by: user.id,
        created_by_email: user.email,
      });
      toast({ title: "Comment saved" });
      setCommentDialogOpen(false);
    } catch (error) {
      console.error("Error saving comment:", error);
      toast({ title: "Error", description: "Failed to save comment", variant: "destructive" });
    }
  }, [selectedCellForComment, user, toast]);

  const handleUpdateComment = useCallback(async (commentId: string, comment: string) => {
    try {
      await supabase.from("cell_comments").update({ comment, updated_at: new Date().toISOString() }).eq("id", commentId);
      toast({ title: "Comment updated" });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({ title: "Error", description: "Failed to update comment", variant: "destructive" });
    }
  }, [toast]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await supabase.from("cell_comments").delete().eq("id", commentId);
      toast({ title: "Comment deleted" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    }
  }, [toast]);

  // Counts
  const editedCount = editedCells.filter(Boolean).length;
  const capturedCount = capturedCells.filter(Boolean).length;
  const paidCount = paidCells.filter(Boolean).length;
  const reEditedCount = reEditedCells.filter(Boolean).length;
  const editedPaidCount = editedPaidCells.filter(Boolean).length;
  const reCapturedCount = reCapturedCells.filter(Boolean).length;

  const handleResetConfirmed = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("tracker_data")
        .update({
          edited_cells: Array(180).fill(false),
          captured_cells: Array(180).fill(false),
          paid_cells: Array(180).fill(false),
          re_edited_cells: Array(180).fill(false),
          edited_paid_cells: Array(180).fill(false),
          re_captured_cells: Array(180).fill(false),
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      setEditedCells(Array(180).fill(false));
      setCapturedCells(Array(180).fill(false));
      setPaidCells(Array(180).fill(false));
      setReEditedCells(Array(180).fill(false));
      setEditedPaidCells(Array(180).fill(false));
      setReCapturedCells(Array(180).fill(false));
      
      toast({ title: "Data Reset", description: "All tracking data has been cleared." });
    } catch (error) {
      console.error("Error resetting data:", error);
      toast({ title: "Error", description: "Failed to reset data.", variant: "destructive" });
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
          re_edited_cells: reEditedCells,
          edited_paid_cells: editedPaidCells,
          re_captured_cells: reCapturedCells,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      toast({ title: "Saved!", description: "Your progress has been saved to the cloud." });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({ title: "Error", description: "Failed to save data.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV({ 
      editedCells, capturedCells, paidCells, 
      reEditedCells, editedPaidCells, reCapturedCells,
      comments 
    });
    toast({ title: "Exported!", description: "Data exported as CSV file." });
  };

  const handleExportExcel = () => {
    exportToExcel({ 
      editedCells, capturedCells, paidCells, 
      reEditedCells, editedPaidCells, reCapturedCells,
      comments 
    });
    toast({ title: "Exported!", description: "Data exported as Excel file." });
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "You have been logged out." });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading tracker data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header with Counter Boxes */}
      <div className="sticky-header">
        <div className="max-w-full mx-auto px-2 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                📹 Video & Cassette Tracker
              </h1>
              <p className="text-xs text-muted-foreground">
                {user?.user_metadata?.display_name || user?.email} • {isAdmin ? "Admin" : "Viewer"}
              </p>
            </div>
            <div className="flex gap-1 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="gap-1">
                <Settings className="w-3 h-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-3 h-3" />
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
                  <Button variant="outline" size="sm" onClick={handleSave} className="gap-1" disabled={saving}>
                    <Save className="w-3 h-3" />
                    {saving ? "..." : "Save"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setResetDialogOpen(true)} className="gap-1" disabled={saving}>
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </Button>
                </>
              )}
              
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Counter Boxes */}
          <CounterBoxes
            editedCount={editedCount}
            reEditedCount={reEditedCount}
            editedPaidCount={editedPaidCount}
            capturedCount={capturedCount}
            reCapturedCount={reCapturedCount}
            capturedPaidCount={paidCount}
          />
        </div>
      </div>

      {/* Tracker Sections */}
      <div className="max-w-full mx-auto px-2 pb-4 select-none">
        <TrackerSection
          title="ኤዲት የተሰሩ (Edited Videos)"
          type="edited"
          cells={editedCells}
          reActionCells={reEditedCells}
          paidCells={editedPaidCells}
          comments={comments}
          onToggleCell={handleEditedMouseDown}
          onToggleReAction={toggleReEdited}
          onTogglePaid={toggleEditedPaid}
          onOpenComment={(index) => openCommentDialog(index, "edited")}
          readOnly={!isAdmin}
          isSelecting={isSelectingEdited}
          onMouseDown={handleEditedMouseDown}
          onMouseEnter={handleEditedMouseEnter}
        />

        <TrackerSection
          title="ካፕቸር የተደረጉ (Captured Cassettes)"
          type="captured"
          cells={capturedCells}
          reActionCells={reCapturedCells}
          paidCells={paidCells}
          comments={comments}
          onToggleCell={handleCapturedMouseDown}
          onToggleReAction={toggleReCaptured}
          onTogglePaid={toggleCapturedPaid}
          onOpenComment={(index) => openCommentDialog(index, "captured")}
          readOnly={!isAdmin}
          isSelecting={isSelectingCaptured}
          onMouseDown={handleCapturedMouseDown}
          onMouseEnter={handleCapturedMouseEnter}
        />
      </div>

      {/* Comment Dialog */}
      {selectedCellForComment && (
        <CommentDialog
          open={commentDialogOpen}
          onOpenChange={setCommentDialogOpen}
          cellIndex={selectedCellForComment.index}
          section={selectedCellForComment.section}
          existingComment={getExistingComment()}
          onSave={handleSaveComment}
          onUpdate={handleUpdateComment}
          onDelete={handleDeleteComment}
          readOnly={!isAdmin}
        />
      )}

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleResetConfirmed}
      />
    </div>
  );
};

export default VideoTracker;
