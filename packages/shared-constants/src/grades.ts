/**
 * Grade levels in Vietnamese education system.
 */

export const GRADES = [
  { id: 'grade-6', vi: 'Lớp 6', level: 'thcs' },
  { id: 'grade-7', vi: 'Lớp 7', level: 'thcs' },
  { id: 'grade-8', vi: 'Lớp 8', level: 'thcs' },
  { id: 'grade-9', vi: 'Lớp 9', level: 'thcs' },
  { id: 'grade-10', vi: 'Lớp 10', level: 'thpt' },
  { id: 'grade-11', vi: 'Lớp 11', level: 'thpt' },
  { id: 'grade-12', vi: 'Lớp 12', level: 'thpt' },
  { id: 'uni-1', vi: 'ĐH năm 1', level: 'dh' },
  { id: 'uni-2', vi: 'ĐH năm 2', level: 'dh' },
  { id: 'uni-3', vi: 'ĐH năm 3', level: 'dh' },
  { id: 'uni-4', vi: 'ĐH năm 4', level: 'dh' },
  { id: 'postgrad', vi: 'Sau ĐH', level: 'sdh' },
  { id: 'other', vi: 'Khác', level: 'other' },
] as const;

export type GradeId = (typeof GRADES)[number]['id'];
