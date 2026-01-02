import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, Settings, Download, RotateCcw, LogOut, FileSpreadsheet, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface HamburgerMenuProps {
  userName: string;
  isAdmin: boolean;
  isDarkMode: boolean;
  saving: boolean;
  onToggleDarkMode: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onSave: () => void;
  onReset: () => void;
  onLogout: () => void;
}

const HamburgerMenu = ({
  userName,
  isAdmin,
  isDarkMode,
  saving,
  onToggleDarkMode,
  onExportCSV,
  onExportExcel,
  onSave,
  onReset,
  onLogout,
}: HamburgerMenuProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "Viewer"}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => handleAction(onToggleDarkMode)}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => handleNavigation("/profile")}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>

          <Separator className="my-2" />

          {/* Admin Only Actions */}
          {isAdmin && (
            <>
              <p className="text-xs text-muted-foreground px-3 py-2">Admin Actions</p>
              
              {/* Export Options */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => handleAction(onExportCSV)}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export as CSV
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => handleAction(onExportExcel)}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export as Excel
              </Button>

              {/* Save */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => handleAction(onSave)}
                disabled={saving}
              >
                <Download className="w-4 h-4" />
                {saving ? "Saving..." : "Save Progress"}
              </Button>

              {/* Reset */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleAction(onReset)}
                disabled={saving}
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Data
              </Button>

              <Separator className="my-2" />
            </>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => handleAction(onLogout)}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;
