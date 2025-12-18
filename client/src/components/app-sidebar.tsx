import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FileText,
  Home,
  Plus,
  Clock,
  FolderOpen,
  BookOpen,
  CheckSquare,
  FileCheck,
  UserCog,
  ScrollText,
  ChevronRight,
  Building2,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";
import { useAuth } from "@/lib/auth";
import type { Document } from "@shared/schema";

export function AppSidebar() {
  const { t } = useTranslation("common");
  const { t: tDashboard } = useTranslation("dashboard");
  const { t: tAdmin } = useTranslation("admin");
  const [location] = useLocation();
  const { user, canEdit } = useAuth();

  // Fetch documents for client grouping
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Group documents by client
  const documentsByClient = documents.reduce((acc, doc) => {
    const client = doc.company || "Geral";
    if (!acc[client]) {
      acc[client] = [];
    }
    acc[client].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Sort clients alphabetically and sort documents within each client by creation date
  const sortedClients = Object.keys(documentsByClient).sort((a, b) => {
    if (a === "Geral") return 1;
    if (b === "Geral") return -1;
    return a.localeCompare(b);
  });

  const mainNavItems = [
    { title: t("navigation.dashboard"), url: "/", icon: Home },
    { title: t("navigation.recent"), url: "/recent", icon: Clock },
  ];

  const categoryItems = [
    { title: t("categories.manuals"), url: "/category/manual", icon: BookOpen, count: 0 },
    { title: t("categories.checklists"), url: "/category/checklist", icon: CheckSquare, count: 0 },
    { title: t("categories.guides"), url: "/category/guide", icon: FileCheck, count: 0 },
  ];

  // Generate document ID with sequential number per client
  const getDocumentId = (client: string, index: number) => {
    return String(index + 1).padStart(3, "0");
  };

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
            <span className="text-lg font-semibold tracking-tight">{t("appName")}</span>
            <span className="text-xs text-muted-foreground">{t("appDescription")}</span>
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
                  {tDashboard("newDocument")}
                </Button>
              </Link>
            </div>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("navigation.title")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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

        {/* Documents by Client - Collapsible Folders */}
        {sortedClients.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("navigation.allDocuments")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sortedClients.map((client) => {
                  const clientDocs = documentsByClient[client].sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                  return (
                    <Collapsible key={client} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <Building2 className="h-4 w-4" />
                            <span>{client}</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {clientDocs.length}
                            </Badge>
                            <ChevronRight className="ml-1 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {clientDocs.map((doc, index) => (
                              <SidebarMenuSubItem key={doc.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={location === `/document/${doc.id}`}
                                >
                                  <Link href={`/document/${doc.id}`}>
                                    <span className="font-mono text-xs text-muted-foreground mr-2">
                                      {getDocumentId(client, index)}
                                    </span>
                                    <span>{doc.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("categories.title")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categoryItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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

        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tAdmin("title")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/users"}
                    data-testid="nav-users"
                  >
                    <Link href="/users">
                      <UserCog className="h-4 w-4" />
                      <span>{tAdmin("users.title")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/audit-logs"}
                    data-testid="nav-audit-logs"
                  >
                    <Link href="/audit-logs">
                      <ScrollText className="h-4 w-4" />
                      <span>{tAdmin("auditLogs.title")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarUserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
