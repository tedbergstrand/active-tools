/** Format a Date as YYYY-MM-DD using local time components (not UTC). */
export function localDateISO(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Return a YYYY-MM-DD string for N days ago in local time. */
export function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDateISO(d);
}

/** Subtract one day from a YYYY-MM-DD string, returning YYYY-MM-DD in local time. */
export function prevDateISO(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return localDateISO(d);
}

/** Diff in days between two YYYY-MM-DD strings (a - b). */
export function dateDiffDays(a, b) {
  return Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 86400000);
}
