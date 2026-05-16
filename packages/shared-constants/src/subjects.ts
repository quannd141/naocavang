/**
 * Vietnamese curriculum subjects.
 * Maps internal subject ID → display name in VI/EN.
 */

export const SUBJECTS = [
  { id: 'math', vi: 'Toán', en: 'Math', emoji: '🧮' },
  { id: 'physics', vi: 'Vật lý', en: 'Physics', emoji: '⚛️' },
  { id: 'chemistry', vi: 'Hóa học', en: 'Chemistry', emoji: '🧪' },
  { id: 'biology', vi: 'Sinh học', en: 'Biology', emoji: '🌱' },
  { id: 'history', vi: 'Lịch sử', en: 'History', emoji: '📜' },
  { id: 'geography', vi: 'Địa lý', en: 'Geography', emoji: '🌏' },
  { id: 'literature', vi: 'Ngữ văn', en: 'Literature', emoji: '📖' },
  { id: 'english', vi: 'Tiếng Anh', en: 'English', emoji: '🇬🇧' },
  { id: 'civics', vi: 'GDCD', en: 'Civics', emoji: '⚖️' },
  { id: 'informatics', vi: 'Tin học', en: 'Informatics', emoji: '💻' },
  { id: 'ielts', vi: 'IELTS', en: 'IELTS', emoji: '🎯' },
  { id: 'toeic', vi: 'TOEIC', en: 'TOEIC', emoji: '🎯' },
  { id: 'other', vi: 'Khác', en: 'Other', emoji: '📚' },
] as const;

export type SubjectId = (typeof SUBJECTS)[number]['id'];

export function getSubjectName(id: SubjectId, locale: 'vi' | 'en' = 'vi'): string {
  const subject = SUBJECTS.find((s) => s.id === id);
  return subject ? subject[locale] : id;
}
