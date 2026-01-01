import { cn } from "@/lib/utils";

interface TrackerCellProps {
  number: number;
  isFilled: boolean;
  isPaid?: boolean;
  type: "edited" | "captured";
  isSelecting?: boolean;
  readOnly?: boolean;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const TrackerCell = ({ 
  number, 
  isFilled, 
  isPaid = false, 
  type, 
  isSelecting = false,
  readOnly = false,
  onMouseDown,
  onMouseEnter,
  onContextMenu
}: TrackerCellProps) => {
  return (
    <div
      className={cn(
        "tracker-cell",
        isFilled && type === "edited" && "edited-filled",
        isFilled && type === "captured" && "captured-filled",
        readOnly && "cursor-default opacity-90"
      )}
      onMouseDown={!readOnly ? onMouseDown : undefined}
      onMouseEnter={!readOnly && isSelecting ? onMouseEnter : undefined}
      onContextMenu={!readOnly ? onContextMenu : undefined}
      title={
        readOnly 
          ? "View only - Admin access required to edit" 
          : type === "captured" 
            ? "Click/drag to toggle color, Right-click to toggle PAID" 
            : "Click/drag to toggle color"
      }
    >
      <span>{number}</span>
      {isPaid && type === "captured" && (
        <span className="paid-label">PAID</span>
      )}
    </div>
  );
};

export default TrackerCell;
