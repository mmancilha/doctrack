"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const roleColors: Record<string, string> = {
  admin: "bg-primary text-primary-foreground",
  editor: "bg-blue-500 text-white dark:bg-blue-600",
  reader: "bg-muted text-muted-foreground",
};

export function UserMenu() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          data-testid="button-user-menu"
          className="flex items-center gap-2"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium">{user.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span>{user.username}</span>
          <Badge variant="secondary" className={`w-fit ${roleColors[user.role]}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem
              data-testid="menu-audit-logs"
              onClick={() => router.push("/audit-logs")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Audit Logs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          data-testid="menu-logout"
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
