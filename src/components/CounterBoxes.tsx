import ExportCounter from "./ExportCounter";

interface CounterBoxesProps {
  editedCount: number;
  reEditedCount: number;
  editedPaidCount: number;
  capturedCount: number;
  reCapturedCount: number;
  capturedPaidCount: number;
  exportCount: number;
  onExportCountChange: (value: number) => void;
  isAdmin: boolean;
}

const CounterBoxes = ({
  editedCount,
  reEditedCount,
  editedPaidCount,
  capturedCount,
  reCapturedCount,
  capturedPaidCount,
  exportCount,
  onExportCountChange,
  isAdmin,
}: CounterBoxesProps) => {
  return (
    <div className="space-y-2">
      {/* Row 1: Edited Section Counters */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-box-edited p-2 md:p-3 rounded-md text-center shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-white">{editedCount}</div>
          <div className="text-[10px] md:text-xs font-medium text-white/90">Edited</div>
        </div>
        <div className="p-2 md:p-3 rounded-md text-center shadow-sm bg-box-reedit">
          <div className="text-xl md:text-2xl font-bold text-white">{reEditedCount}</div>
          <div className="text-[10px] md:text-xs font-medium text-white/90">Re-Edit</div>
        </div>
        <div className="p-2 md:p-3 rounded-md text-center shadow-sm bg-box-green">
          <div className="text-xl md:text-2xl font-bold text-white">{editedPaidCount}</div>
          <div className="text-[10px] md:text-xs font-medium text-white/90">Edit Paid</div>
        </div>
        <ExportCounter 
          value={exportCount} 
          onChange={onExportCountChange} 
          isAdmin={isAdmin} 
        />
      </div>
      
      {/* Row 2: Captured Section Counters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-box-captured p-2 md:p-3 rounded-md text-center shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-white">{capturedCount}</div>
          <div className="text-[10px] md:text-xs font-medium text-white/90">Captured</div>
        </div>
        <div className="p-2 md:p-3 rounded-md text-center shadow-sm bg-box-maroon">
          <div className="text-xl md:text-2xl font-bold text-white">{reCapturedCount}</div>
          <div className="text-[10px] md:text-xs font-medium text-white/90">Re-Capture</div>
        </div>
        <div className="p-2 md:p-3 rounded-md text-center shadow-sm bg-box-green">
          <div className="text-xl md:text-2xl font-bold text-white">{capturedPaidCount}</div>
          <div className="text-[10px] md:text-xs font-medium text-white/90">Capt Paid</div>
        </div>
      </div>
    </div>
  );
};

export default CounterBoxes;
