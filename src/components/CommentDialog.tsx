import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, X, MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  comment: string;
  created_by_email: string;
  created_at: string;
  updated_at: string;
}

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cellIndex: number;
  section: string;
  existingComment?: Comment | null;
  onSave: (comment: string) => Promise<void>;
  onUpdate: (commentId: string, comment: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  readOnly?: boolean;
}

const CommentDialog = ({
  open,
  onOpenChange,
  cellIndex,
  section,
  existingComment,
  onSave,
  onUpdate,
  onDelete,
  readOnly = false,
}: CommentDialogProps) => {
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingComment) {
      setComment(existingComment.comment);
      setIsEditing(false);
    } else {
      setComment("");
      setIsEditing(true);
    }
  }, [existingComment, open]);

  const handleSave = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      if (existingComment && isEditing) {
        await onUpdate(existingComment.id, comment);
      } else if (!existingComment) {
        await onSave(comment);
      }
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingComment) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setSaving(true);
    try {
      await onDelete(existingComment.id);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-primary-foreground">
                  Cassette {cellIndex + 1}
                </DialogTitle>
                <p className="text-sm text-primary-foreground/80 capitalize">{section} Section</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5">
          {existingComment && !isEditing ? (
            <div className="space-y-4">
              {/* Comment Display Card */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">{existingComment.comment}</p>
              </div>
              
              {!readOnly && (
                <DialogFooter className="gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 rounded-xl flex-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={saving}
                    className="gap-2 rounded-xl flex-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </DialogFooter>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                placeholder="Write your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                disabled={readOnly}
                className="rounded-xl resize-none border-border/50 focus:border-primary bg-muted/30"
              />
              {!readOnly && (
                <DialogFooter className="gap-2 pt-2">
                  {existingComment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setComment(existingComment.comment);
                        setIsEditing(false);
                      }}
                      className="gap-2 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={saving || !comment.trim()}
                    size="sm"
                    className="gap-2 rounded-xl flex-1"
                  >
                    {saving ? "Saving..." : existingComment ? "Update Comment" : "Save Comment"}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
