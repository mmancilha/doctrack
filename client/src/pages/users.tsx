import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, Shield, Edit2, UserCog, Eye, Pencil, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

interface UserData {
  id: string;
  username: string;
  role: string;
  avatarUrl: string | null;
}

export default function UsersPage() {
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<string>("reader");
  const [editRole, setEditRole] = useState<string>("");
  const [editPassword, setEditPassword] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const createUser = useMutation({
    mutationFn: async (data: { username: string; password: string; role: string }) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewRole("reader");
      toast({ title: t("users.toast.created.title"), description: t("users.toast.created.description") });
    },
    onError: (error: any) => {
      toast({ title: tCommon("errors.generic"), description: error.message || t("users.toast.error.create"), variant: "destructive" });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, role, password }: { id: string; role?: string; password?: string }) => {
      const body: any = {};
      if (role) body.role = role;
      if (password) body.password = password;
      const response = await apiRequest("PATCH", `/api/users/${id}`, body);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      setEditRole("");
      setEditPassword("");
      toast({ title: t("users.toast.updated.title"), description: t("users.toast.updated.description") });
    },
    onError: () => {
      toast({ title: tCommon("errors.generic"), description: t("users.toast.error.update"), variant: "destructive" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: t("users.toast.deleted.title"), description: t("users.toast.deleted.description") });
    },
    onError: (error: any) => {
      toast({ title: tCommon("errors.generic"), description: error.message || t("users.toast.error.delete"), variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast({ title: tCommon("errors.generic"), description: t("users.toast.error.required"), variant: "destructive" });
      return;
    }
    createUser.mutate({ username: newUsername, password: newPassword, role: newRole });
  };

  const handleUpdate = () => {
    if (!editingUser) return;
    if (!editRole && !editPassword) {
      toast({ title: tCommon("errors.generic"), description: t("users.toast.error.noChanges"), variant: "destructive" });
      return;
    }
    updateUser.mutate({ 
      id: editingUser.id, 
      role: editRole || undefined, 
      password: editPassword || undefined 
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "default";
      case "editor": return "secondary";
      default: return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-3 w-3" />;
      case "editor": return <Pencil className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return tCommon("roles.admin");
      case "editor": return tCommon("roles.editor");
      default: return tCommon("roles.reader");
    }
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-destructive/10 rounded-full p-4">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t("users.accessDenied.title")}</h2>
                <p className="text-muted-foreground mt-2">
                  {t("users.accessDenied.description")}
                </p>
              </div>
              <Button onClick={() => setLocation("/")} variant="outline">
                {tCommon("buttons.goToDashboard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("users.loadingUsers")}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-md p-2">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("users.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("users.description")}</p>
            </div>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-user">
                <Plus className="mr-2 h-4 w-4" />
                {t("users.addUser")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("users.create.title")}</DialogTitle>
                <DialogDescription>
                  {t("users.create.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("users.create.username")}</Label>
                  <Input
                    id="username"
                    data-testid="input-new-username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={t("users.create.usernamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("users.create.password")}</Label>
                  <Input
                    id="password"
                    data-testid="input-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("users.create.passwordPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t("users.create.role")}</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger data-testid="select-new-role">
                      <SelectValue placeholder={t("users.create.role")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reader">{t("users.create.roleReader")}</SelectItem>
                      <SelectItem value="editor">{t("users.create.roleEditor")}</SelectItem>
                      <SelectItem value="admin">{t("users.create.roleAdmin")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {tCommon("buttons.cancel")}
                </Button>
                <Button onClick={handleCreate} disabled={createUser.isPending} data-testid="button-submit-create">
                  {createUser.isPending ? t("users.create.creating") : t("users.create.submit")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("users.allUsers")} ({users.length})
            </CardTitle>
            <CardDescription>
              {t("users.usersWithAccess")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between gap-4 p-4 rounded-md bg-muted/50"
                    data-testid={`user-row-${user.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium" data-testid={`text-username-${user.id}`}>{user.username}</p>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{getRoleLabel(user.role)}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.id !== currentUser?.id && (
                        <>
                          <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => {
                            if (!open) {
                              setEditingUser(null);
                              setEditRole("");
                              setEditPassword("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingUser(user);
                                  setEditRole(user.role);
                                }}
                                data-testid={`button-edit-${user.id}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t("users.edit.title", { username: user.username })}</DialogTitle>
                                <DialogDescription>
                                  {t("users.edit.description")}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-role">{t("users.edit.role")}</Label>
                                  <Select value={editRole} onValueChange={setEditRole}>
                                    <SelectTrigger data-testid="select-edit-role">
                                      <SelectValue placeholder={t("users.edit.role")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="reader">{tCommon("roles.reader")}</SelectItem>
                                      <SelectItem value="editor">{tCommon("roles.editor")}</SelectItem>
                                      <SelectItem value="admin">{tCommon("roles.admin")}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-password">{t("users.edit.newPassword")}</Label>
                                  <Input
                                    id="edit-password"
                                    data-testid="input-edit-password"
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder={t("users.edit.newPasswordPlaceholder")}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingUser(null)}>
                                  {tCommon("buttons.cancel")}
                                </Button>
                                <Button onClick={handleUpdate} disabled={updateUser.isPending} data-testid="button-submit-edit">
                                  {updateUser.isPending ? t("users.edit.saving") : t("users.edit.submit")}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-delete-${user.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("users.delete.title")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("users.delete.description", { username: user.username })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{tCommon("buttons.cancel")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser.mutate(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-testid={`button-confirm-delete-${user.id}`}
                                >
                                  {tCommon("buttons.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">{t("users.you")}</Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
