import TrackerCell from "./TrackerCell";

interface TrackerSectionProps {
  title: string;
  type: "edited" | "captured";
  cells: boolean[];
  paidCells?: boolean[];
  onToggleCell: (index: number) => void;
  onTogglePaid?: (index: number) => void;
  count: number;
  paidCount?: number;
  readOnly?: boolean;
  isSelecting?: boolean;
  onMouseDown?: (index: number) => void;
  onMouseEnter?: (index: number) => void;
}

const TrackerSection = ({ 
  title, 
  type, 
  cells, 
  paidCells = [],
  onToggleCell,
  onTogglePaid,
  count,
  paidCount = 0,
  readOnly = false,
  isSelecting = false,
  onMouseDown,
  onMouseEnter
}: TrackerSectionProps) => {
  // Create rows of 33 cells each (like in the reference image)
  const cellsPerRow = 33;
  const rows: number[][] = [];
  
  for (let i = 0; i < 180; i += cellsPerRow) {
    const row: number[] = [];
    for (let j = i; j < Math.min(i + cellsPerRow, 180); j++) {
      row.push(j + 1);
    }
    rows.push(row);
  }

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (type === "captured" && onTogglePaid && !readOnly) {
      onTogglePaid(index);
    }
  };

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className={`section-header ${type}`}>
        {title}
      </div>
      
      {/* Grid of cells */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((num) => (
                <TrackerCell
                  key={num}
                  number={num}
                  isFilled={cells[num - 1]}
                  isPaid={paidCells[num - 1]}
                  type={type}
                  readOnly={readOnly}
                  isSelecting={isSelecting}
                  onMouseDown={() => onMouseDown?.(num - 1)}
                  onMouseEnter={() => onMouseEnter?.(num - 1)}
                  onContextMenu={(e) => handleContextMenu(e, num - 1)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Counter Display */}
      <div className="counter-display">
        {count}
        {type === "captured" && paidCount > 0 && (
          <span className="text-lg ml-4 opacity-80">
            (Paid: {paidCount})
          </span>
        )}
      </div>
    </div>
  );
};

export default TrackerSection;
