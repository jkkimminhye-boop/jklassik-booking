// 운영 시간
export const AM_SLOTS = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
export const PM_SLOTS = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
export const ALL_SLOTS = [...AM_SLOTS, ...PM_SLOTS];

// 공휴일 (Supabase에서도 관리)
export const HOLIDAYS = [
  '2026-01-01',
  '2026-02-16',
  '2026-02-17',
  '2026-02-18',
  '2026-03-01',
  '2026-05-05',
  '2026-06-06',
  '2026-08-17',
  '2026-09-24',
  '2026-09-25',
  '2026-09-26',
  '2026-10-05',
  '2026-10-09',
  '2026-12-25',
];

// 날짜 포맷
export const formatDate = (date: Date): string => {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};

// 월요일 기준 주 시작 날짜 구하기
export const getMonday = (ref: Date): Date => {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
};

// 공휴일 체크
export const isHoliday = (date: Date): boolean => {
  return HOLIDAYS.includes(formatDate(date));
};

// 예약 마감 체크 (영업일 기준 1일 전)
export const isBookingOpen = (slotDate: Date, slotTime: string, now: Date): boolean => {
  const dow = slotDate.getDay();
  
  // 월요일: 금요일 23:59까지 예약 가능
  if (dow === 1) {
    const fri = new Date(slotDate);
    fri.setDate(slotDate.getDate() - 3);
    fri.setHours(23, 59, 59, 999);
    return now <= fri;
  }
  
  // 다른 요일: 24시간 전 영업시간 마감
  const [h, m] = slotTime.split(':').map(Number);
  const slotDT = new Date(slotDate);
  slotDT.setHours(h, m, 0, 0);
  
  const cutoff = new Date(slotDT.getTime() - 24 * 60 * 60 * 1000);
  let d = new Date(cutoff);
  d.setHours(0, 0, 0, 0);
  
  // 토, 일, 공휴일 제외하고 역산
  while (d.getDay() === 0 || d.getDay() === 6 || isHoliday(d)) {
    d.setDate(d.getDate() - 1);
  }
  
  const deadline = new Date(d);
  deadline.setHours(cutoff.getHours(), cutoff.getMinutes(), 0, 0);
  
  return now <= deadline;
};

// 예약번호 생성
export const generateBookingNo = (date: Date): string => {
  const dateStr = date.getFullYear().toString().slice(-2) + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `JK-${dateStr}-${random}`;
};

// 토큰 생성 (취소·변경 링크용)
export const generateToken = (): string => {
  return Buffer.from(Math.random().toString(36).substring(2, 15)).toString('hex').substring(0, 32);
};

// 요일 이름
export const getDayName = (dayOfWeek: number): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[dayOfWeek];
};
