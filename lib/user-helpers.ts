/**
 * Helper functions for user name handling (server-side)
 */

export interface UserNameFields {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  username: string;
}

/**
 * Obtém o nome completo do usuário (firstName + lastName)
 * Se não houver firstName/lastName, usa displayName como fallback
 */
export function getFullName(user: UserNameFields): string {
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
export function getFirstName(user: UserNameFields): string {
  if (user.firstName) {
    return user.firstName;
  }
  
  // Fallback: pegar primeira palavra do displayName ou username
  const fallback = user.displayName || user.username;
  return fallback.split(" ")[0];
}

