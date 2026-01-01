import { cn } from "@/lib/utils";

interface TrackerCellProps {
  number: number;
  isFilled: boolean;
  isPaid?: boolean;
  type: "edited" | "captured";
  onToggle: () => void;
  onTogglePaid?: () => void;
}

const TrackerCell = ({ 
  number, 
  isFilled, 
  isPaid = false, 
  type, 
  onToggle,
  onTogglePaid 
}: TrackerCellProps) => {
  const handleClick = () => {
    onToggle();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (type === "captured" && onTogglePaid) {
      onTogglePaid();
    }
  };

  return (
    <div
      className={cn(
        "tracker-cell",
        isFilled && type === "edited" && "edited-filled",
        isFilled && type === "captured" && "captured-filled"
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={type === "captured" ? "Left-click to toggle color, Right-click to toggle PAID" : "Click to toggle color"}
    >
      <span>{number}</span>
      {isPaid && type === "captured" && (
        <span className="paid-label">PAID</span>
      )}
    </div>
  );
};

export default TrackerCell;
