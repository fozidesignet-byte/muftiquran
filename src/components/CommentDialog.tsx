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
import { Trash2, Edit2, X } from "lucide-react";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Comment for Cassette {cellIndex + 1}
          </DialogTitle>
        </DialogHeader>

        {existingComment && !isEditing ? (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <p className="whitespace-pre-wrap">{existingComment.comment}</p>
            </div>
            {!readOnly && (
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={saving}
                  className="gap-2"
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
              placeholder="Enter your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={readOnly}
            />
            {!readOnly && (
              <DialogFooter className="gap-2">
                {existingComment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setComment(existingComment.comment);
                      setIsEditing(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving || !comment.trim()}
                  size="sm"
                >
                  {saving ? "Saving..." : existingComment ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
