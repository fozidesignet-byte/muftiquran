import { useState, useEffect, useRef } from "react";
import { Bell, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  cell_index: number;
  section: string;
  comment: string;
  created_by: string;
  created_by_email: string;
  created_at: string;
}

interface NotificationBellProps {
  userId: string;
  comments: Comment[];
  onNavigateToComment: (cellIndex: number, section: string) => void;
}

// Create a notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log("Could not play notification sound:", error);
  }
};

const NotificationBell = ({ userId, comments, onNavigateToComment }: NotificationBellProps) => {
  const [lastSeenAt, setLastSeenAt] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const previousCommentsCount = useRef<number>(0);
  const isInitialized = useRef(false);

  // Load last seen timestamp
  useEffect(() => {
    const loadLastSeen = async () => {
      const { data } = await supabase
        .from("user_comment_notifications")
        .select("last_seen_at")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (data) {
        setLastSeenAt(new Date(data.last_seen_at));
      } else {
        // Create initial record
        await supabase.from("user_comment_notifications").insert({
          user_id: userId,
          last_seen_at: new Date().toISOString(),
        });
        setLastSeenAt(new Date());
      }
    };

    if (userId) {
      loadLastSeen();
    }
  }, [userId]);

  // Get new comments (comments created after last seen, not by current user)
  const newComments = comments.filter(comment => {
    if (!lastSeenAt) return false;
    if (comment.created_by === userId) return false;
    return new Date(comment.created_at) > lastSeenAt;
  });

  const unreadCount = newComments.length;

  // Play sound when new comments arrive
  useEffect(() => {
    if (!isInitialized.current) {
      previousCommentsCount.current = unreadCount;
      isInitialized.current = true;
      return;
    }

    if (unreadCount > previousCommentsCount.current) {
      playNotificationSound();
    }
    previousCommentsCount.current = unreadCount;
  }, [unreadCount]);

  // Mark as read when popover opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      const now = new Date().toISOString();
      await supabase
        .from("user_comment_notifications")
        .update({ last_seen_at: now })
        .eq("user_id", userId);
      // Don't reset lastSeenAt immediately - let user see the notifications first
    }
  };

  const handleCommentClick = async (comment: Comment) => {
    setOpen(false);
    
    // Update last seen to now so notifications are cleared
    const now = new Date().toISOString();
    await supabase
      .from("user_comment_notifications")
      .update({ last_seen_at: now })
      .eq("user_id", userId);
    setLastSeenAt(new Date());
    
    // Navigate to the commented cell
    onNavigateToComment(comment.cell_index, comment.section);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 shrink-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              {unreadCount} new
            </span>
          )}
        </div>
        <ScrollArea className="h-64">
          {newComments.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No new comments
            </div>
          ) : (
            <div className="divide-y">
              {newComments.slice(0, 20).map((comment) => (
                <button
                  key={comment.id}
                  onClick={() => handleCommentClick(comment)}
                  className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {comment.created_by_email?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {comment.created_by_email?.split("@")[0] || "User"}
                        </span>
                        {" commented on "}
                        <span className="font-medium text-primary">
                          {comment.section === "edited" ? "Edit" : "Capture"} #{comment.cell_index + 1}
                        </span>
                      </p>
                      <p className="text-sm truncate mt-0.5">{comment.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
