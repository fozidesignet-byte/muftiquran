interface CounterBoxesProps {
  editedCount: number;
  reEditedCount: number;
  editedPaidCount: number;
  capturedCount: number;
  reCapturedCount: number;
  capturedPaidCount: number;
}

const CounterBoxes = ({
  editedCount,
  reEditedCount,
  editedPaidCount,
  capturedCount,
  reCapturedCount,
  capturedPaidCount,
}: CounterBoxesProps) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {/* Edited Section Counters */}
      <div className="bg-edited-header p-2 md:p-3 rounded-md text-center shadow-sm">
        <div className="text-xl md:text-2xl font-bold text-foreground">{editedCount}</div>
        <div className="text-[10px] md:text-xs font-medium text-foreground/80">Edited</div>
      </div>
      <div className="p-2 md:p-3 rounded-md text-center shadow-sm bg-re-action">
        <div className="text-xl md:text-2xl font-bold text-white">{reEditedCount}</div>
        <div className="text-[10px] md:text-xs font-medium text-white/90">Re-Edit</div>
      </div>
      <div className="p-2 md:p-3 rounded-md text-center shadow-sm bg-paid-color">
        <div className="text-xl md:text-2xl font-bold text-white">{editedPaidCount}</div>
        <div className="text-[10px] md:text-xs font-medium text-white/90">Edit Paid</div>
      </div>
      
      {/* Captured Section Counters */}
      <div className="bg-captured-header p-2 md:p-3 rounded-md text-center shadow-sm">
        <div className="text-xl md:text-2xl font-bold text-white">{capturedCount}</div>
        <div className="text-[10px] md:text-xs font-medium text-white/90">Captured</div>
      </div>
      <div className="p-2 md:p-3 rounded-md text-center shadow-sm bg-re-action">
        <div className="text-xl md:text-2xl font-bold text-white">{reCapturedCount}</div>
        <div className="text-[10px] md:text-xs font-medium text-white/90">Re-Capture</div>
      </div>
      <div className="p-2 md:p-3 rounded-md text-center shadow-sm bg-paid-color">
        <div className="text-xl md:text-2xl font-bold text-white">{capturedPaidCount}</div>
        <div className="text-[10px] md:text-xs font-medium text-white/90">Capt Paid</div>
      </div>
    </div>
  );
};

export default CounterBoxes;
