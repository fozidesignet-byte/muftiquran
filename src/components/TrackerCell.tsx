import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { useRef, useCallback } from "react";

interface TrackerCellProps {
  number: number;
  isFilled: boolean;
  isReActionFilled?: boolean;
  isPaid?: boolean;
  type: "edited" | "captured";
  hasComment?: boolean;
  readOnly?: boolean;
  // Separate selection states for each part
  isSelectingMain?: boolean;
  isSelectingR?: boolean;
  isSelectingP?: boolean;
  // Main cell handlers
  onMainMouseDown?: () => void;
  onMainMouseEnter?: () => void;
  // R handlers
  onRMouseDown?: () => void;
  onRMouseEnter?: () => void;
  // P handlers
  onPMouseDown?: () => void;
  onPMouseEnter?: () => void;
  // Double click for comment (only view)
  onDoubleClick?: () => void;
}

const TrackerCell = ({ 
  number, 
  isFilled, 
  isReActionFilled = false,
  isPaid = false, 
  type, 
  hasComment = false,
  readOnly = false,
  isSelectingMain = false,
  isSelectingR = false,
  isSelectingP = false,
  onMainMouseDown,
  onMainMouseEnter,
  onRMouseDown,
  onRMouseEnter,
  onPMouseDown,
  onPMouseEnter,
  onDoubleClick
}: TrackerCellProps) => {
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingClickRef = useRef<(() => void) | null>(null);
  
  // Mouse handlers for Main - delay to detect double-click
  const handleMainMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || readOnly) return;
    
    // Store the action but delay execution to check for double-click
    pendingClickRef.current = () => onMainMouseDown?.();
    
    // Clear any existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    // Delay single click to allow double-click detection
    clickTimerRef.current = setTimeout(() => {
      pendingClickRef.current?.();
      pendingClickRef.current = null;
    }, 200);
  };

  const handleMainMouseEnter = () => {
    if (readOnly || !isSelectingMain) return;
    onMainMouseEnter?.();
  };

  // Double click opens comment dialog - cancel the pending single click
  const handleMainDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Cancel the pending single click action
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    pendingClickRef.current = null;
    
    onDoubleClick?.();
  };

  // Touch handlers for Main
  const handleMainTouchStart = useCallback((e: React.TouchEvent) => {
    if (readOnly) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Long press for comment dialog (admin can add/edit/delete)
    touchTimerRef.current = setTimeout(() => {
      onDoubleClick?.();
    }, 500);
    
    // Immediate tap for selection
    onMainMouseDown?.();
  }, [readOnly, hasComment, onDoubleClick, onMainMouseDown]);

  const handleMainTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    
    // Get touch position and find element under touch
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // If we're dragging over another cell's main area, trigger its enter handler
    if (element?.classList.contains('cell-main-area') && isSelectingMain) {
      const cellContainer = element.closest('.tracker-cell-container');
      if (cellContainer) {
        // Trigger mouse enter effect via a custom approach
        onMainMouseEnter?.();
      }
    }
  }, [isSelectingMain, onMainMouseEnter]);

  const handleMainTouchEnd = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    touchStartPosRef.current = null;
  }, []);

  // Mouse handlers for R
  const handleRMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0 || readOnly) return;
    if (!isFilled) return;
    onRMouseDown?.();
  };

  const handleRMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !isSelectingR || !isFilled) return;
    onRMouseEnter?.();
  };

  // Touch handlers for R
  const handleRTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (readOnly || !isFilled) return;
    onRMouseDown?.();
  }, [readOnly, isFilled, onRMouseDown]);

  // Mouse handlers for P
  const handlePMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0 || readOnly) return;
    if (!isFilled) return;
    onPMouseDown?.();
  };

  const handlePMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !isSelectingP || !isFilled) return;
    onPMouseEnter?.();
  };

  // Touch handlers for P
  const handlePTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (readOnly || !isFilled) return;
    onPMouseDown?.();
  }, [readOnly, isFilled, onPMouseDown]);

  return (
    <div
      className={cn(
        "tracker-cell-container",
        readOnly && "cursor-default"
      )}
      title={
        readOnly 
          ? (hasComment ? "Double-click to view comment" : "View only")
          : "Click/drag: Main | R | P • Double-click for comment"
      }
    >
      {/* Comment indicator */}
      {hasComment && (
        <MessageSquare className="comment-indicator" />
      )}
      
      {/* Top half: Main cell with number */}
      <div
        className={cn(
          "cell-main-area",
          isFilled && type === "edited" && "edited-filled",
          isFilled && type === "captured" && "captured-filled"
        )}
        onMouseDown={handleMainMouseDown}
        onMouseEnter={handleMainMouseEnter}
        onDoubleClick={handleMainDoubleClick}
        onTouchStart={handleMainTouchStart}
        onTouchMove={handleMainTouchMove}
        onTouchEnd={handleMainTouchEnd}
      >
        <span className={cn("cell-number", isFilled && "text-white")}>
          {number}
        </span>
      </div>
      
      {/* Bottom half: R and P side by side */}
      <div className="cell-bottom-row">
        <div
          className={cn(
            "cell-r-area",
            isReActionFilled && "active",
            !isFilled && "disabled"
          )}
          onMouseDown={handleRMouseDown}
          onMouseEnter={handleRMouseEnter}
          onTouchStart={handleRTouchStart}
          title={isFilled ? (type === "edited" ? "Re-Edit" : "Re-Capture") : "Fill main cell first"}
        >
          R
        </div>
        <div
          className={cn(
            "cell-p-area",
            isPaid && "active",
            !isFilled && "disabled"
          )}
          onMouseDown={handlePMouseDown}
          onMouseEnter={handlePMouseEnter}
          onTouchStart={handlePTouchStart}
          title={isFilled ? "Paid" : "Fill main cell first"}
        >
          P
        </div>
      </div>
    </div>
  );
};

export default TrackerCell;
