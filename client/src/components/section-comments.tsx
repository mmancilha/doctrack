import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/date-utils";
import type { Comment } from "@shared/schema";

interface SectionCommentsProps {
  documentId: string;
  selectedText?: string;
  onClose?: () => void;
}

export function SectionComments({ documentId, selectedText, onClose }: SectionCommentsProps) {
  const { t, i18n } = useTranslation("documents");
  const { user, canEdit } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [showInput, setShowInput] = useState(false);

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/documents", documentId, "comments"],
  });

  const addComment = useMutation({
    mutationFn: async (data: { content: string; sectionId?: string; sectionText?: string }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/comments`, {
        ...data,
        authorId: user?.id || "",
        authorName: user?.username || "",
        resolved: "false",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "comments"] });
      setNewComment("");
      setShowInput(false);
      toast({ title: t("comments.toast.added.title"), description: t("comments.toast.added.description") });
    },
    onError: () => {
      toast({ title: t("toast.error.title"), description: t("comments.toast.error.add"), variant: "destructive" });
    },
  });

  const resolveComment = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiRequest("PATCH", `/api/comments/${commentId}`, {
        resolved: "true",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "comments"] });
      toast({ title: t("comments.toast.deleted.title") });
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    addComment.mutate({
      content: newComment,
      sectionId: selectedText ? `section-${Date.now()}` : undefined,
      sectionText: selectedText || undefined,
    });
  };

  const unresolvedComments = comments.filter((c) => c.resolved !== "true");
  const resolvedComments = comments.filter((c) => c.resolved === "true");

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {t("comments.title")} ({unresolvedComments.length})
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {selectedText && (
          <div className="p-3 bg-muted rounded-md border-l-4 border-primary">
            <p className="text-xs text-muted-foreground mb-1">{t("comments.selectedText")}:</p>
            <p className="text-sm italic line-clamp-3">"{selectedText}"</p>
          </div>
        )}

        <div className="flex gap-2">
          {!showInput ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowInput(true)}
              data-testid="button-add-comment"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("comments.addComment")}
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <Textarea
                placeholder={t("comments.placeholder")}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                data-testid="input-comment"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || addComment.isPending}
                  data-testid="button-submit-comment"
                >
                  <Send className="mr-2 h-3 w-3" />
                  {t("comments.send")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowInput(false);
                    setNewComment("");
                  }}
                >
                  {t("comments.cancel")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t("comments.loading")}</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t("comments.noComments")}</p>
          ) : (
            <div className="space-y-4">
              {unresolvedComments.length > 0 && (
                <div className="space-y-3">
                  <AnimatePresence>
                    {unresolvedComments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-muted/50 rounded-md space-y-2"
                        data-testid={`comment-${comment.id}`}
                      >
                        {comment.sectionText && (
                          <div className="text-xs text-muted-foreground border-l-2 border-primary/50 pl-2 italic">
                            "{comment.sectionText.slice(0, 100)}{comment.sectionText.length > 100 ? "..." : ""}"
                          </div>
                        )}
                        <p className="text-sm">{comment.content}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{comment.authorName}</span>
                            <span>·</span>
                            <span>{formatRelativeTime(new Date(comment.createdAt), i18n.language)}</span>
                          </div>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveComment.mutate(comment.id)}
                              className="h-7 text-xs"
                              data-testid={`button-resolve-${comment.id}`}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              {t("comments.resolve")}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {resolvedComments.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">{t("comments.resolved")} ({resolvedComments.length})</p>
                  {resolvedComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-muted/30 rounded-md space-y-2 opacity-60"
                    >
                      {comment.sectionText && (
                        <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2 italic line-through">
                          "{comment.sectionText.slice(0, 50)}..."
                        </div>
                      )}
                      <p className="text-sm line-through">{comment.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{t("comments.resolved")}</Badge>
                        <span>{comment.authorName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
