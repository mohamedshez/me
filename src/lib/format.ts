export function formatDate(date: string | null) {
  if (!date || !Number.isFinite(Date.parse(date))) return "No activity date";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date));
}
export function projectTitle(name: string) {
  return name.replace(/[-_]/g, " ");
}
