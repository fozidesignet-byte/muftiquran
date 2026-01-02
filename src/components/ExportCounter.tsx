import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Edit2 } from "lucide-react";

interface ExportCounterProps {
  value: number;
  onChange: (value: number) => void;
  isAdmin: boolean;
}

const ExportCounter = ({ value, onChange, isAdmin }: ExportCounterProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    } else {
      setInputValue(value.toString());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value.toString());
    setIsEditing(false);
  };

  if (!isAdmin) {
    return (
      <div className="bg-primary/10 p-2 md:p-3 rounded-md text-center shadow-sm">
        <div className="text-xl md:text-2xl font-bold text-primary">{value}</div>
        <div className="text-[10px] md:text-xs font-medium text-muted-foreground">Exported</div>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 p-2 md:p-3 rounded-md text-center shadow-sm">
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-7 text-center text-lg font-bold p-1"
            min={0}
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancel}>
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      ) : (
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <div className="text-xl md:text-2xl font-bold text-primary flex items-center justify-center gap-1">
            {value}
            <Edit2 className="w-3 h-3 opacity-50" />
          </div>
          <div className="text-[10px] md:text-xs font-medium text-muted-foreground">Exported</div>
        </div>
      )}
    </div>
  );
};

export default ExportCounter;
