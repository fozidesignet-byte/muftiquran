import TrackerCell from "./TrackerCell";

interface Comment {
  id: string;
  cell_index: number;
  section: string;
  comment: string;
}

interface TrackerSectionProps {
  title: string;
  type: "edited" | "captured";
  cells: boolean[];
  reActionCells: boolean[];
  paidCells: boolean[];
  comments: Comment[];
  onToggleCell: (index: number) => void;
  onToggleReAction: (index: number) => void;
  onTogglePaid: (index: number) => void;
  onOpenComment: (index: number) => void;
  readOnly?: boolean;
  isSelecting?: boolean;
  onMouseDown?: (index: number) => void;
  onMouseEnter?: (index: number) => void;
}

const TrackerSection = ({ 
  title, 
  type, 
  cells, 
  reActionCells,
  paidCells,
  comments,
  onToggleCell,
  onToggleReAction,
  onTogglePaid,
  onOpenComment,
  readOnly = false,
  isSelecting = false,
  onMouseDown,
  onMouseEnter
}: TrackerSectionProps) => {
  // Calculate columns to fit all 180 cells without scrolling
  // Using CSS grid with auto-fit to maximize cells per row
  const hasComment = (index: number) => {
    return comments.some(c => c.cell_index === index && c.section === type);
  };

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className={`section-header ${type}`}>
        {title}
      </div>
      
      {/* Grid of cells - auto-scaling */}
      <div className="tracker-grid">
        {Array.from({ length: 180 }, (_, i) => i + 1).map((num) => (
          <TrackerCell
            key={num}
            number={num}
            isFilled={cells[num - 1]}
            isReActionFilled={reActionCells[num - 1]}
            isPaid={paidCells[num - 1]}
            type={type}
            hasComment={hasComment(num - 1)}
            readOnly={readOnly}
            isSelecting={isSelecting}
            onMouseDown={() => onMouseDown?.(num - 1)}
            onMouseEnter={() => onMouseEnter?.(num - 1)}
            onReActionClick={() => onToggleReAction(num - 1)}
            onPaidClick={() => onTogglePaid(num - 1)}
            onLongPress={() => onOpenComment(num - 1)}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackerSection;
