export const YDS_GRADES = [
  '5.5', '5.6', '5.7', '5.8', '5.9',
  '5.10a', '5.10b', '5.10c', '5.10d',
  '5.11a', '5.11b', '5.11c', '5.11d',
  '5.12a', '5.12b', '5.12c', '5.12d',
  '5.13a', '5.13b', '5.13c', '5.13d',
  '5.14a', '5.14b', '5.14c', '5.14d',
  '5.15a', '5.15b', '5.15c',
];

export const FRENCH_GRADES = [
  '4a', '4b', '4c', '5a', '5b', '5c',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
  '9a', '9a+', '9b', '9b+', '9c',
];

export const V_GRADES = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7',
  'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17',
];

export const FONT_GRADES = [
  '3', '4', '4+', '5', '5+', '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
  '9a',
];

const YDS_TO_INDEX = Object.fromEntries(YDS_GRADES.map((g, i) => [g, i]));
const V_TO_INDEX = Object.fromEntries(V_GRADES.map((g, i) => [g, i]));

export function getGradesForSystem(system) {
  switch (system) {
    case 'yds': return YDS_GRADES;
    case 'french': return FRENCH_GRADES;
    case 'v_scale': return V_GRADES;
    case 'font': return FONT_GRADES;
    default: return YDS_GRADES;
  }
}

export function gradeToNumeric(grade) {
  if (!grade) return -1;
  const ydsIdx = YDS_TO_INDEX[grade];
  if (ydsIdx !== undefined) return ydsIdx;
  const vIdx = V_TO_INDEX[grade];
  if (vIdx !== undefined) return vIdx;
  const frIdx = FRENCH_GRADES.indexOf(grade);
  if (frIdx !== -1) return frIdx;
  const fontIdx = FONT_GRADES.indexOf(grade);
  if (fontIdx !== -1) return fontIdx;
  return -1;
}

export function compareGrades(a, b) {
  return gradeToNumeric(a) - gradeToNumeric(b);
}
