export const DAYS_OPTIONS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت - الأربعاء",
  "السبت - الخميس",
  "طوال الأسبوع",
];

export type WorkShift = { day: string; time: string; location: string };
export type CenterHours = { openTime: string; closeTime: string; is24h: boolean };
