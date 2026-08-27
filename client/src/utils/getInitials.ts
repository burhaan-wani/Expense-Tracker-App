export function getInitials(name: string): string {
  const parts = name.split(" ");

  const initials =
    parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : parts[0]?.[0].toUpperCase() + parts[1]?.[0].toUpperCase();

  return initials;
}
