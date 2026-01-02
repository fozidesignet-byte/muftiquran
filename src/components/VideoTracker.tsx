import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TrackerSection from "./TrackerSection";
import CounterBoxes from "./CounterBoxes";
import CommentDialog from "./CommentDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import StickyScrollHeader from "./StickyScrollHeader";
import SummaryPage from "./SummaryPage";
import HamburgerMenu from "./HamburgerMenu";
import { Button } from "@/components/ui/button";
import { BarChart3, Grid3X3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, exportToExcel } from "@/lib/exportData";

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
  
  // Refs for sections
  const editedSectionRef = useRef<HTMLDivElement>(null);
  const capturedSectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<"progress" | "summary">("progress");
  
  // Main cells
  const [editedCells, setEditedCells] = useState<boolean[]>(Array(180).fill(false));
  const [capturedCells, setCapturedCells] = useState<boolean[]>(Array(180).fill(false));
  const [paidCells, setPaidCells] = useState<boolean[]>(Array(180).fill(false));
  
  // Re-action and paid cells
  const [reEditedCells, setReEditedCells] = useState<boolean[]>(Array(180).fill(false));
  const [editedPaidCells, setEditedPaidCells] = useState<boolean[]>(Array(180).fill(false));
  const [reCapturedCells, setReCapturedCells] = useState<boolean[]>(Array(180).fill(false));
  
  // Export counter (admin editable)
  const [exportCount, setExportCount] = useState(0);
  
  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Dialog states
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedCellForComment, setSelectedCellForComment] = useState<{ index: number; section: string } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  // Drag selection state - separate for main, R, P per section
  const [isSelectingEditedMain, setIsSelectingEditedMain] = useState(false);
  const [isSelectingEditedR, setIsSelectingEditedR] = useState(false);
  const [isSelectingEditedP, setIsSelectingEditedP] = useState(false);
  const [isSelectingCapturedMain, setIsSelectingCapturedMain] = useState(false);
  const [isSelectingCapturedR, setIsSelectingCapturedR] = useState(false);
  const [isSelectingCapturedP, setIsSelectingCapturedP] = useState(false);
  const [selectionMode, setSelectionMode] = useState<boolean | null>(null);

  // Measure header height for sticky scroll header positioning
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

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
        
        // Load export count from localStorage
        const savedExportCount = localStorage.getItem('exportCount');
        if (savedExportCount) {
          setExportCount(parseInt(savedExportCount, 10));
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

  // Handle mouse up and touch end to stop selection
  useEffect(() => {
    const handleSelectionEnd = () => {
      setIsSelectingEditedMain(false);
      setIsSelectingEditedR(false);
      setIsSelectingEditedP(false);
      setIsSelectingCapturedMain(false);
      setIsSelectingCapturedR(false);
      setIsSelectingCapturedP(false);
      setSelectionMode(null);
    };

    window.addEventListener("mouseup", handleSelectionEnd);
    window.addEventListener("touchend", handleSelectionEnd);
    window.addEventListener("touchcancel", handleSelectionEnd);
    return () => {
      window.removeEventListener("mouseup", handleSelectionEnd);
      window.removeEventListener("touchend", handleSelectionEnd);
      window.removeEventListener("touchcancel", handleSelectionEnd);
    };
  }, []);

  // Handle export count change
  const handleExportCountChange = (value: number) => {
    setExportCount(value);
    localStorage.setItem('exportCount', value.toString());
  };

  // EDITED SECTION - Main cell handlers
  const handleEditedMainMouseDown = useCallback((index: number) => {
    if (!isAdmin) return;
    setIsSelectingEditedMain(true);
    const newMode = !editedCells[index];
    setSelectionMode(newMode);
    setEditedCells(prev => {
      const newCells = [...prev];
      newCells[index] = newMode;
      if (!newMode) {
        setReEditedCells(prevR => {
          const newR = [...prevR];
          newR[index] = false;
          return newR;
        });
        setEditedPaidCells(prevP => {
          const newP = [...prevP];
          newP[index] = false;
          return newP;
        });
      }
      return newCells;
    });
  }, [isAdmin, editedCells]);

  const handleEditedMainMouseEnter = useCallback((index: number) => {
    if (!isSelectingEditedMain || selectionMode === null) return;
    setEditedCells(prev => {
      const newCells = [...prev];
      newCells[index] = selectionMode;
      if (!selectionMode) {
        setReEditedCells(prevR => {
          const newR = [...prevR];
          newR[index] = false;
          return newR;
        });
        setEditedPaidCells(prevP => {
          const newP = [...prevP];
          newP[index] = false;
          return newP;
        });
      }
      return newCells;
    });
  }, [isSelectingEditedMain, selectionMode]);

  // EDITED SECTION - R handlers
  const handleEditedRMouseDown = useCallback((index: number) => {
    if (!isAdmin || !editedCells[index]) return;
    setIsSelectingEditedR(true);
    const newMode = !reEditedCells[index];
    setSelectionMode(newMode);
    setReEditedCells(prev => {
      const newCells = [...prev];
      newCells[index] = newMode;
      return newCells;
    });
  }, [isAdmin, editedCells, reEditedCells]);

  const handleEditedRMouseEnter = useCallback((index: number) => {
    if (!isSelectingEditedR || selectionMode === null || !editedCells[index]) return;
    setReEditedCells(prev => {
      const newCells = [...prev];
      newCells[index] = selectionMode;
      return newCells;
    });
  }, [isSelectingEditedR, selectionMode, editedCells]);

  // EDITED SECTION - P handlers
  const handleEditedPMouseDown = useCallback((index: number) => {
    if (!isAdmin || !editedCells[index]) return;
    setIsSelectingEditedP(true);
    const newMode = !editedPaidCells[index];
    setSelectionMode(newMode);
    setEditedPaidCells(prev => {
      const newCells = [...prev];
      newCells[index] = newMode;
      return newCells;
    });
  }, [isAdmin, editedCells, editedPaidCells]);

  const handleEditedPMouseEnter = useCallback((index: number) => {
    if (!isSelectingEditedP || selectionMode === null || !editedCells[index]) return;
    setEditedPaidCells(prev => {
      const newCells = [...prev];
      newCells[index] = selectionMode;
      return newCells;
    });
  }, [isSelectingEditedP, selectionMode, editedCells]);

  // CAPTURED SECTION - Main cell handlers
  const handleCapturedMainMouseDown = useCallback((index: number) => {
    if (!isAdmin) return;
    setIsSelectingCapturedMain(true);
    const newMode = !capturedCells[index];
    setSelectionMode(newMode);
    setCapturedCells(prev => {
      const newCells = [...prev];
      newCells[index] = newMode;
      if (!newMode) {
        setReCapturedCells(prevR => {
          const newR = [...prevR];
          newR[index] = false;
          return newR;
        });
        setPaidCells(prevP => {
          const newP = [...prevP];
          newP[index] = false;
          return newP;
        });
      }
      return newCells;
    });
  }, [isAdmin, capturedCells]);

  const handleCapturedMainMouseEnter = useCallback((index: number) => {
    if (!isSelectingCapturedMain || selectionMode === null) return;
    setCapturedCells(prev => {
      const newCells = [...prev];
      newCells[index] = selectionMode;
      if (!selectionMode) {
        setReCapturedCells(prevR => {
          const newR = [...prevR];
          newR[index] = false;
          return newR;
        });
        setPaidCells(prevP => {
          const newP = [...prevP];
          newP[index] = false;
          return newP;
        });
      }
      return newCells;
    });
  }, [isSelectingCapturedMain, selectionMode]);

  // CAPTURED SECTION - R handlers
  const handleCapturedRMouseDown = useCallback((index: number) => {
    if (!isAdmin || !capturedCells[index]) return;
    setIsSelectingCapturedR(true);
    const newMode = !reCapturedCells[index];
    setSelectionMode(newMode);
    setReCapturedCells(prev => {
      const newCells = [...prev];
      newCells[index] = newMode;
      return newCells;
    });
  }, [isAdmin, capturedCells, reCapturedCells]);

  const handleCapturedRMouseEnter = useCallback((index: number) => {
    if (!isSelectingCapturedR || selectionMode === null || !capturedCells[index]) return;
    setReCapturedCells(prev => {
      const newCells = [...prev];
      newCells[index] = selectionMode;
      return newCells;
    });
  }, [isSelectingCapturedR, selectionMode, capturedCells]);

  // CAPTURED SECTION - P handlers
  const handleCapturedPMouseDown = useCallback((index: number) => {
    if (!isAdmin || !capturedCells[index]) return;
    setIsSelectingCapturedP(true);
    const newMode = !paidCells[index];
    setSelectionMode(newMode);
    setPaidCells(prev => {
      const newCells = [...prev];
      newCells[index] = newMode;
      return newCells;
    });
  }, [isAdmin, capturedCells, paidCells]);

  const handleCapturedPMouseEnter = useCallback((index: number) => {
    if (!isSelectingCapturedP || selectionMode === null || !capturedCells[index]) return;
    setPaidCells(prev => {
      const newCells = [...prev];
      newCells[index] = selectionMode;
      return newCells;
    });
  }, [isSelectingCapturedP, selectionMode, capturedCells]);

  const openCommentDialog = useCallback((index: number, section: string) => {
    const hasComment = comments.some(c => c.cell_index === index && c.section === section);
    if (!isAdmin && !hasComment) return;
    setSelectedCellForComment({ index, section });
    setCommentDialogOpen(true);
  }, [comments, isAdmin]);

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
      setExportCount(0);
      localStorage.setItem('exportCount', '0');
      
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

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
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
      {/* Sticky Header */}
      <div className="sticky-header" ref={headerRef}>
        <div className="max-w-full mx-auto px-2 pt-2">
          {/* Top bar with hamburger and title */}
          <div className="flex items-center gap-2 mb-2">
            <HamburgerMenu
              userName={user?.user_metadata?.display_name || user?.email || "User"}
              isAdmin={isAdmin}
              isDarkMode={isDarkMode}
              saving={saving}
              onToggleDarkMode={toggleDarkMode}
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onSave={handleSave}
              onReset={() => setResetDialogOpen(true)}
              onLogout={handleLogout}
            />
            
            {/* Islamic Header Title */}
            <div className="islamic-header flex-1">
              <div className="islamic-pattern-left">☪</div>
              <div className="text-center flex-1">
                <h1 className="islamic-title text-sm md:text-lg">
                  Mufi Hajj Umer Idris Quran Tefseer
                </h1>
                <p className="islamic-subtitle text-[10px] md:text-xs">
                  Video Editing & Cassette Tracker
                </p>
              </div>
              <div className="islamic-pattern-right">☪</div>
            </div>
          </div>

          {/* Counter Boxes - Only show in progress tab */}
          {activeTab === "progress" && (
            <CounterBoxes
              editedCount={editedCount}
              reEditedCount={reEditedCount}
              editedPaidCount={editedPaidCount}
              capturedCount={capturedCount}
              reCapturedCount={reCapturedCount}
              capturedPaidCount={paidCount}
              exportCount={exportCount}
              onExportCountChange={handleExportCountChange}
              isAdmin={isAdmin}
            />
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-2 pb-2">
            <Button 
              variant={activeTab === "progress" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveTab("progress")}
              className="flex-1 gap-1"
            >
              <Grid3X3 className="w-3 h-3" />
              Progress
            </Button>
            <Button 
              variant={activeTab === "summary" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveTab("summary")}
              className="flex-1 gap-1"
            >
              <BarChart3 className="w-3 h-3" />
              Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Scroll Header for Progress tab */}
      {activeTab === "progress" && (
        <StickyScrollHeader
          editedSectionRef={editedSectionRef}
          capturedSectionRef={capturedSectionRef}
          headerOffset={headerHeight}
        />
      )}

      {/* Content based on active tab */}
      {activeTab === "progress" ? (
        <>
          {/* Tracker Sections */}
          <div className="max-w-full mx-auto px-2 pb-4 select-none">
            <TrackerSection
              ref={editedSectionRef}
              title="ኤዲት የተሰሩ (Edited Videos)"
              type="edited"
              cells={editedCells}
              reActionCells={reEditedCells}
              paidCells={editedPaidCells}
              comments={comments}
              readOnly={!isAdmin}
              isSelectingMain={isSelectingEditedMain}
              isSelectingR={isSelectingEditedR}
              isSelectingP={isSelectingEditedP}
              onMainMouseDown={handleEditedMainMouseDown}
              onMainMouseEnter={handleEditedMainMouseEnter}
              onRMouseDown={handleEditedRMouseDown}
              onRMouseEnter={handleEditedRMouseEnter}
              onPMouseDown={handleEditedPMouseDown}
              onPMouseEnter={handleEditedPMouseEnter}
              onOpenComment={(index) => openCommentDialog(index, "edited")}
            />

            <TrackerSection
              ref={capturedSectionRef}
              title="ካፕቸር የተደረጉ (Captured Cassettes)"
              type="captured"
              cells={capturedCells}
              reActionCells={reCapturedCells}
              paidCells={paidCells}
              comments={comments}
              readOnly={!isAdmin}
              isSelectingMain={isSelectingCapturedMain}
              isSelectingR={isSelectingCapturedR}
              isSelectingP={isSelectingCapturedP}
              onMainMouseDown={handleCapturedMainMouseDown}
              onMainMouseEnter={handleCapturedMainMouseEnter}
              onRMouseDown={handleCapturedRMouseDown}
              onRMouseEnter={handleCapturedRMouseEnter}
              onPMouseDown={handleCapturedPMouseDown}
              onPMouseEnter={handleCapturedPMouseEnter}
              onOpenComment={(index) => openCommentDialog(index, "captured")}
            />
          </div>
        </>
      ) : (
        <SummaryPage
          editedCells={editedCells}
          reEditedCells={reEditedCells}
          editedPaidCells={editedPaidCells}
          capturedCells={capturedCells}
          reCapturedCells={reCapturedCells}
          paidCells={paidCells}
        />
      )}

      {/* Footer */}
      <div className="powered-by-footer">
        Powered By - <span>AnwarulHadi</span>
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
