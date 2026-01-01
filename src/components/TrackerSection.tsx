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
}

const TrackerSection = ({ 
  title, 
  type, 
  cells, 
  paidCells = [],
  onToggleCell,
  onTogglePaid,
  count,
  paidCount = 0
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
                  onToggle={() => onToggleCell(num - 1)}
                  onTogglePaid={onTogglePaid ? () => onTogglePaid(num - 1) : undefined}
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
