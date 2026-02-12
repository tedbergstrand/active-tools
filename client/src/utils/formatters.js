export function formatDuration(minutes) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatSeconds(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatWeight(kg, units = 'metric') {
  if (kg == null) return '—';
  if (units === 'imperial') return `${Math.round(kg * 2.205)}lbs`;
  return `${kg}kg`;
}

export function kgToLbs(kg) {
  return Math.round(kg * 2.205);
}

export function lbsToKg(lbs) {
  return Math.round(lbs / 2.205 * 10) / 10;
}

export function parseNumericInput(value) {
  return value === '' ? '' : Number(value);
}
