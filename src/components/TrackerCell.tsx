import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

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
  // Double click for comment
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
  
  const handleMainMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || readOnly) return;
    onMainMouseDown?.();
  };

  const handleMainMouseEnter = () => {
    if (readOnly || !isSelectingMain) return;
    onMainMouseEnter?.();
  };

  const handleMainDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onDoubleClick?.();
  };

  const handleRMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0 || readOnly) return;
    // R can only be selected if main is filled
    if (!isFilled) return;
    onRMouseDown?.();
  };

  const handleRMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !isSelectingR || !isFilled) return;
    onRMouseEnter?.();
  };

  const handlePMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0 || readOnly) return;
    // P can only be selected if main is filled
    if (!isFilled) return;
    onPMouseDown?.();
  };

  const handlePMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !isSelectingP || !isFilled) return;
    onPMouseEnter?.();
  };

  return (
    <div
      className={cn(
        "tracker-cell-container",
        readOnly && "cursor-default"
      )}
      title={
        readOnly 
          ? "View only - Double-click to view comment" 
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
      >
        <span className={cn("cell-number", isFilled && type === "captured" && "text-white")}>
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
          title={isFilled ? "Paid" : "Fill main cell first"}
        >
          P
        </div>
      </div>
    </div>
  );
};

export default TrackerCell;
