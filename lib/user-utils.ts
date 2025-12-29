import type { User } from "@shared/schema";

/**
 * Obtém o nome completo do usuário (firstName + lastName)
 * Se não houver firstName/lastName, usa displayName como fallback
 */
export function getFullName(user: { firstName?: string | null; lastName?: string | null; displayName?: string | null; username: string }): string {
  if (user.firstName) {
    const parts = [user.firstName];
    if (user.lastName) {
      parts.push(user.lastName);
    }
    return parts.join(" ");
  }
  
  // Fallback para displayName ou username
  return user.displayName || user.username;
}

/**
 * Obtém apenas o primeiro nome do usuário
 * Se não houver firstName, usa a primeira palavra do displayName ou username
 */
export function getFirstName(user: { firstName?: string | null; lastName?: string | null; displayName?: string | null; username: string }): string {
  if (user.firstName) {
    return user.firstName;
  }
  
  // Fallback: pegar primeira palavra do displayName ou username
  const fallback = user.displayName || user.username;
  return fallback.split(" ")[0];
}

/**
 * Obtém as iniciais do usuário (primeira letra do primeiro e último nome)
 */
export function getInitials(user: { firstName?: string | null; lastName?: string | null; displayName?: string | null; username: string }): string {
  if (user.firstName) {
    const parts = [user.firstName[0].toUpperCase()];
    if (user.lastName && user.lastName.length > 0) {
      parts.push(user.lastName[0].toUpperCase());
    }
    return parts.join("");
  }
  
  // Fallback: usar displayName ou username
  const fallback = user.displayName || user.username;
  return fallback
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

