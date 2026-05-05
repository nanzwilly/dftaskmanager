/**
 * Format a Date as dd/mm/yyyy.
 * Hand-rolled (no toLocaleDateString) so the output is identical
 * on server and client regardless of locale — required to avoid
 * Next.js hydration mismatches.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
