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
    <div className="sticky top-0 z-40 bg-background pb-4 pt-2">
      <div className="grid grid-cols-6 gap-2">
        {/* Edited Section Counters */}
        <div className="bg-edited-header p-3 rounded text-center">
          <div className="text-2xl font-bold text-foreground">{editedCount}</div>
          <div className="text-xs font-medium text-foreground/80">Edited</div>
        </div>
        <div className="bg-edited-header/70 p-3 rounded text-center">
          <div className="text-2xl font-bold text-foreground">{reEditedCount}</div>
          <div className="text-xs font-medium text-foreground/80">Re-Edit</div>
        </div>
        <div className="bg-edited-header/50 p-3 rounded text-center border-2 border-paid-text">
          <div className="text-2xl font-bold text-paid-text">{editedPaidCount}</div>
          <div className="text-xs font-medium text-foreground/80">Edit Paid</div>
        </div>
        
        {/* Captured Section Counters */}
        <div className="bg-captured-header p-3 rounded text-center">
          <div className="text-2xl font-bold text-counter-text">{capturedCount}</div>
          <div className="text-xs font-medium text-counter-text/80">Captured</div>
        </div>
        <div className="bg-captured-header/70 p-3 rounded text-center">
          <div className="text-2xl font-bold text-counter-text">{reCapturedCount}</div>
          <div className="text-xs font-medium text-counter-text/80">Re-Capture</div>
        </div>
        <div className="bg-captured-header/50 p-3 rounded text-center border-2 border-paid-text">
          <div className="text-2xl font-bold text-paid-text">{capturedPaidCount}</div>
          <div className="text-xs font-medium text-foreground/80">Capt Paid</div>
        </div>
      </div>
    </div>
  );
};

export default CounterBoxes;
