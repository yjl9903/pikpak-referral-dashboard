export function formatFilterDate(date: Date): string {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7; // Sunday = 0 -> 7
  d.setDate(d.getDate() - (day - 1));
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function getRange(start: Date, end: Date): [string, string] {
  return [formatFilterDate(start), formatFilterDate(end)];
}

export function generatePredefinedFilterDates() {
  const today = new Date();
  return {
    last7Days: getRange(new Date(today.getTime() - 6 * 86400_000), today),
    thisWeek: getRange(startOfWeek(today), today),
    last30Days: getRange(new Date(today.getTime() - 29 * 86400_000), today),
    thisMonth: getRange(startOfMonth(today), today),
    last90Days: getRange(new Date(today.getTime() - 89 * 86400_000), today),
    last6Months: getRange(
      new Date(today.getFullYear(), today.getMonth() - 5, today.getDate()),
      today
    ),
    last12Months: getRange(
      new Date(today.getFullYear(), today.getMonth() - 11, today.getDate()),
      today
    ),
    thisYear: getRange(startOfYear(today), today)
  } as const;
}
