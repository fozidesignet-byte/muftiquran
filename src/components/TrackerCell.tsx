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
    if (e.button !== 0) return; // Only left click
    
    // Start long press timer for comment
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

  return (
    <div className="flex">
      {/* Main cell */}
      <div
        className={cn(
          "tracker-cell relative",
          isFilled && type === "edited" && "edited-filled",
          isFilled && type === "captured" && "captured-filled",
          readOnly && "cursor-default opacity-90"
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
        <span>{number}</span>
        {hasComment && (
          <MessageSquare className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-blue-500" />
        )}
      </div>
      
      {/* Re-action mini cell */}
      <div
        className={cn(
          "mini-cell",
          isReActionFilled && type === "edited" && "edited-filled",
          isReActionFilled && type === "captured" && "captured-filled",
          readOnly && "cursor-default opacity-90"
        )}
        onClick={!readOnly ? onReActionClick : undefined}
        title={type === "edited" ? "Re-Edit" : "Re-Capture"}
      >
        <span className="text-[8px]">R</span>
      </div>
      
      {/* Paid mini cell */}
      <div
        className={cn(
          "mini-cell paid-mini-cell",
          isPaid && "paid-filled",
          readOnly && "cursor-default opacity-90"
        )}
        onClick={!readOnly ? onPaidClick : undefined}
        title="Paid"
      >
        <span className="text-[8px]">P</span>
      </div>
    </div>
  );
};

export default TrackerCell;
