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
