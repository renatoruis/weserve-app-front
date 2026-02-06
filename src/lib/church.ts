/**
 * Slug da igreja ativa.
 * No MVP, vem de variável de ambiente.
 * Futuramente: subdomínio ou URL dinâmica.
 */
export function getChurchSlug(): string {
  return process.env.NEXT_PUBLIC_CHURCH_SLUG || "default";
}
