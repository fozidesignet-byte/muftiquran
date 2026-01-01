import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const ResetPasswordDialog = ({ open, onOpenChange, onConfirm }: ResetPasswordDialogProps) => {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleConfirm = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password,
      });

      if (signInError) {
        setError("Incorrect password");
        return;
      }

      // Password verified, proceed with reset
      onConfirm();
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      setError("Failed to verify password");
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Reset</DialogTitle>
          <DialogDescription>
            Enter your password to confirm resetting all tracker data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password">Password</Label>
            <Input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Reset All Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
