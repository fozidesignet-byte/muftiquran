import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfflineScreenProps {
  onRetry: () => void;
}

const OfflineScreen = ({ onRetry }: OfflineScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
      <div className="bg-card rounded-2xl shadow-2xl border border-border p-8 max-w-sm w-full text-center space-y-6">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">No Internet Connection</h2>
          <p className="text-muted-foreground text-sm">
            Please check your connection and try again
          </p>
        </div>

        {/* Amharic */}
        <p className="text-muted-foreground text-xs">
          እባክዎ የበይነመረብ ግንኙነትዎን ያረጋግጡ
        </p>

        {/* Retry Button */}
        <Button 
          onClick={onRetry}
          className="w-full gap-2"
          size="lg"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default OfflineScreen;
