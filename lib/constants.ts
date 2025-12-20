import { useTranslation } from "react-i18next";

export const DOCUMENT_CATEGORIES = [
  { value: "manual", label: "Manual", icon: "BookOpen" },
  { value: "checklist", label: "Checklist", icon: "CheckSquare" },
  { value: "guide", label: "Guide", icon: "FileText" },
  { value: "confidentiality", label: "Confidentiality Agreement", icon: "ShieldCheck" },
  { value: "proposal", label: "Commercial Proposal", icon: "FileSpreadsheet" },
  { value: "contract", label: "Contract", icon: "FileSignature" },
  { value: "policy", label: "Policy", icon: "Scale" },
  { value: "procedure", label: "Procedure", icon: "ListChecks" },
] as const;

export const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft", color: "amber" },
  { value: "published", label: "Published", color: "green" },
  { value: "archived", label: "Archived", color: "gray" },
] as const;

export const DEFAULT_USER = {
  id: "user-1",
  username: "Admin User",
  role: "admin",
  avatarUrl: null,
};

// Hooks for translated constants
export function useDocumentCategories() {
  const { t } = useTranslation("common");
  return [
    { value: "manual", label: t("categories.manual"), icon: "BookOpen" },
    { value: "checklist", label: t("categories.checklist"), icon: "CheckSquare" },
    { value: "guide", label: t("categories.guide"), icon: "FileText" },
    { value: "confidentiality", label: t("categories.confidentiality"), icon: "ShieldCheck" },
    { value: "proposal", label: t("categories.proposal"), icon: "FileSpreadsheet" },
    { value: "contract", label: t("categories.contract"), icon: "FileSignature" },
    { value: "policy", label: t("categories.policy"), icon: "Scale" },
    { value: "procedure", label: t("categories.procedure"), icon: "ListChecks" },
  ] as const;
}

export function useDocumentStatuses() {
  const { t } = useTranslation("common");
  return [
    { value: "draft", label: t("statuses.draft"), color: "amber" },
    { value: "published", label: t("statuses.published"), color: "green" },
    { value: "archived", label: t("statuses.archived"), color: "gray" },
  ] as const;
}

export function useRoles() {
  const { t } = useTranslation("common");
  return {
    admin: t("roles.admin"),
    editor: t("roles.editor"),
    reader: t("roles.reader"),
  };
}

// Category plural labels for category pages
export function useCategoryLabels() {
  const { t } = useTranslation("common");
  return {
    manual: { singular: t("categories.manual"), plural: t("categories.manuals") },
    checklist: { singular: t("categories.checklist"), plural: t("categories.checklists") },
    guide: { singular: t("categories.guide"), plural: t("categories.guides") },
    confidentiality: { singular: t("categories.confidentiality"), plural: t("categories.confidentialities") },
    proposal: { singular: t("categories.proposal"), plural: t("categories.proposals") },
    contract: { singular: t("categories.contract"), plural: t("categories.contracts") },
    policy: { singular: t("categories.policy"), plural: t("categories.policies") },
    procedure: { singular: t("categories.procedure"), plural: t("categories.procedures") },
  };
}
