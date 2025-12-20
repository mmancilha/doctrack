"use client";

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LogOut,
  BadgeCheck,
  Bell,
  Languages,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { ProfileDialog } from "./profile-dialog";
import { supportedLanguages, changeLanguage } from "@/lib/i18n";

const roleColors: Record<string, string> = {
  admin: "bg-primary text-primary-foreground",
  editor: "bg-blue-500 text-white dark:bg-blue-600",
  reader: "bg-muted text-muted-foreground",
};

export function SidebarUserMenu() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isMobile } = useSidebar();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
  };

  const currentLanguage = i18n.language?.split("-")[0] || "en";
  const displayName = user.displayName || user.username;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentLang = supportedLanguages.find((l) => l.code === currentLanguage);
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return t("roles.admin");
      case "editor": return t("roles.editor");
      default: return t("roles.reader");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-sidebar-ring data-[state=open]:bg-sidebar-accent"
          data-testid="sidebar-user-menu"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} className="object-cover" />}
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {getRoleLabel(user.role)}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side={isMobile ? "top" : "right"}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} className="object-cover" />}
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <Badge
                variant="secondary"
                className={`w-fit text-xs mt-1 ${roleColors[user.role]}`}
              >
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem
            data-testid="menu-account"
            onSelect={() => setShowProfileDialog(true)}
          >
            <BadgeCheck className="mr-2 h-4 w-4" />
            {t("menu.account")}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            data-testid="menu-notifications"
            onSelect={() => {
              console.log("Notifications clicked");
            }}
          >
            <Bell className="mr-2 h-4 w-4" />
            {t("menu.notifications")}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger data-testid="menu-language">
              <Languages className="mr-2 h-4 w-4" />
              {t("menu.language")}
              <span className="ml-auto text-xs text-muted-foreground">
                {currentLang?.flag}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    data-testid={`menu-language-${lang.code}`}
                    onSelect={() => handleLanguageChange(lang.code)}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                    {currentLanguage === lang.code && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          data-testid="menu-logout"
          className="text-destructive focus:text-destructive"
          onSelect={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("menu.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ProfileDialog
        user={user}
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />
    </DropdownMenu>
  );
}
