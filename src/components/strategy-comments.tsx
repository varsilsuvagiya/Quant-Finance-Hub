"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  user: {
    _id: string;
    name?: string;
    email: string;
  };
  text: string;
  createdAt: string;
}

interface StrategyCommentsProps {
  strategyId: string;
  isPublic: boolean;
}

export function StrategyComments({
  strategyId,
  isPublic,
}: StrategyCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isPublic && strategyId) {
      fetchComments();
    }
  }, [strategyId, isPublic]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/strategies/comments?strategyId=${strategyId}`
      );
      const data = await res.json();
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/strategies/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId,
          text: newComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setComments(data.data || []);
        setNewComment("");
        toast.success("Comment added");
      } else {
        toast.error(data.error || "Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const res = await fetch(
        `/api/strategies/comments?strategyId=${strategyId}&index=${index}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchComments();
        toast.success("Comment deleted");
      } else {
        toast.error(data.error || "Failed to delete comment");
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  if (!isPublic) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {session && (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newComment.length}/500
              </span>
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                size="sm"
              >
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-4 text-gray-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.user.name?.charAt(0) ||
                      comment.user.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {comment.user.name || comment.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {session &&
                      (session.user?.id === comment.user._id ||
                        session.user?.email === comment.user.email) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
