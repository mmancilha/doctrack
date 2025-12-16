import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  FileText,
  Home,
  Plus,
  Settings,
  Clock,
  FolderOpen,
  BookOpen,
  CheckSquare,
  FileCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "All Documents", url: "/documents", icon: FolderOpen },
  { title: "Recent", url: "/recent", icon: Clock },
];

const categoryItems = [
  { title: "Manuals", url: "/category/manual", icon: BookOpen, count: 0 },
  { title: "Checklists", url: "/category/checklist", icon: CheckSquare, count: 0 },
  { title: "Guides", url: "/category/guide", icon: FileCheck, count: 0 },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, canEdit } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
          >
            <FileText className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">DocTrack</span>
            <span className="text-xs text-muted-foreground">Document Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {canEdit && (
          <SidebarGroup>
            <div className="px-2 pb-2">
              <Link href="/new">
                <Button
                  className="w-full justify-start gap-2"
                  data-testid="button-new-document"
                >
                  <Plus className="h-4 w-4" />
                  New Document
                </Button>
              </Link>
            </div>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categoryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-category-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">{user.username}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
