import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface TrackerCellProps {
  number: number;
  isFilled: boolean;
  isReActionFilled?: boolean;
  isPaid?: boolean;
  type: "edited" | "captured";
  hasComment?: boolean;
  isSelecting?: boolean;
  readOnly?: boolean;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
  onReActionClick?: () => void;
  onPaidClick?: () => void;
  onLongPress?: () => void;
}

const TrackerCell = ({ 
  number, 
  isFilled, 
  isReActionFilled = false,
  isPaid = false, 
  type, 
  hasComment = false,
  isSelecting = false,
  readOnly = false,
  onMouseDown,
  onMouseEnter,
  onReActionClick,
  onPaidClick,
  onLongPress
}: TrackerCellProps) => {
  let longPressTimer: NodeJS.Timeout | null = null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    longPressTimer = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
      }
      longPressTimer = null;
    }, 500);

    if (!readOnly && onMouseDown) {
      onMouseDown();
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const handleReActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly && onReActionClick) {
      onReActionClick();
    }
  };

  const handlePaidClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly && onPaidClick) {
      onPaidClick();
    }
  };

  return (
    <div
      className={cn(
        "tracker-cell-container",
        isFilled && type === "edited" && "edited-filled",
        isFilled && type === "captured" && "captured-filled",
        readOnly && "cursor-default"
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={!readOnly && isSelecting ? onMouseEnter : undefined}
      title={
        readOnly 
          ? "View only - Long press to view comment" 
          : "Click/drag to toggle • Long press for comment"
      }
    >
      {/* Cell number */}
      <span className="cell-number">{number}</span>
      
      {/* Comment indicator */}
      {hasComment && (
        <MessageSquare className="comment-indicator" />
      )}
      
      {/* R and P indicators inside the cell */}
      <div className="cell-indicators">
        <div
          className={cn(
            "indicator-r",
            isReActionFilled && "active"
          )}
          onClick={handleReActionClick}
          title={type === "edited" ? "Re-Edit" : "Re-Capture"}
        >
          R
        </div>
        <div
          className={cn(
            "indicator-p",
            isPaid && "active"
          )}
          onClick={handlePaidClick}
          title="Paid"
        >
          P
        </div>
      </div>
    </div>
  );
};

export default TrackerCell;
