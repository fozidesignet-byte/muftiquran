import { forwardRef } from "react";
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
  readOnly?: boolean;
  // Separate selection states
  isSelectingMain?: boolean;
  isSelectingR?: boolean;
  isSelectingP?: boolean;
  // Main handlers
  onMainMouseDown?: (index: number) => void;
  onMainMouseEnter?: (index: number) => void;
  // R handlers
  onRMouseDown?: (index: number) => void;
  onRMouseEnter?: (index: number) => void;
  // P handlers
  onPMouseDown?: (index: number) => void;
  onPMouseEnter?: (index: number) => void;
  // Comment handler
  onOpenComment: (index: number) => void;
}

const TrackerSection = forwardRef<HTMLDivElement, TrackerSectionProps>(({ 
  title, 
  type, 
  cells, 
  reActionCells,
  paidCells,
  comments,
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
  onOpenComment
}, ref) => {
  const hasComment = (index: number) => {
    return comments.some(c => c.cell_index === index && c.section === type);
  };

  return (
    <div className="mb-4" ref={ref}>
      {/* Section Header */}
      <div className={`section-header ${type}`}>
        {title}
      </div>
      
      {/* Grid of cells */}
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
            isSelectingMain={isSelectingMain}
            isSelectingR={isSelectingR}
            isSelectingP={isSelectingP}
            onMainMouseDown={() => onMainMouseDown?.(num - 1)}
            onMainMouseEnter={() => onMainMouseEnter?.(num - 1)}
            onRMouseDown={() => onRMouseDown?.(num - 1)}
            onRMouseEnter={() => onRMouseEnter?.(num - 1)}
            onPMouseDown={() => onPMouseDown?.(num - 1)}
            onPMouseEnter={() => onPMouseEnter?.(num - 1)}
            onDoubleClick={() => onOpenComment(num - 1)}
          />
        ))}
      </div>
    </div>
  );
});

TrackerSection.displayName = "TrackerSection";

export default TrackerSection;
