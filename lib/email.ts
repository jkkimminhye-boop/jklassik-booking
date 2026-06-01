import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const JKLASSIK_EMAIL = process.env.JKLASSIK_EMAIL || '';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export async function sendBookingConfirmationEmail(
  studentEmail: string,
  studentName: string,
  bookingNo: string,
  consultationDate: string,
  consultationTime: string,
  cancelManageUrl: string
) {
  const dateObj = new Date(consultationDate);
  const monthDay = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
  const dow = DOW[dateObj.getDay()];

  // 학생에게 발송
  await resend.emails.send({
    from: 'JKLASSIK <onboarding@resend.dev>',
    to: studentEmail,
    subject: `[제이클래식] 예약이 완료되었습니다 - ${bookingNo}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b91c1c;">제이클래식 화상상담 예약 완료</h2>
        <p>${studentName}님, 예약이 완료되었습니다.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>예약번호:</strong> ${bookingNo}</p>
          <p><strong>상담 일시:</strong> ${monthDay}(${dow}) ${consultationTime}</p>
          <p><strong>상담 방식:</strong> 화상상담 30분</p>
        </div>
        <p style="color: #dc2626;">⚠️ 담당자의 두번째 문자 혹은 전화를 받아야 상담이 확정됩니다.</p>
        <p>취소/변경: <a href="${cancelManageUrl}">${cancelManageUrl}</a></p>
      </div>
    `,
  });

  // 제이클래식에게 발송
  await resend.emails.send({
    from: 'JKLASSIK <onboarding@resend.dev>',
    to: JKLASSIK_EMAIL,
    subject: `[새 예약] ${studentName} - ${monthDay}(${dow}) ${consultationTime}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b91c1c;">새 예약이 접수되었습니다</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>예약번호:</strong> ${bookingNo}</p>
          <p><strong>이름:</strong> ${studentName}</p>
          <p><strong>상담 일시:</strong> ${monthDay}(${dow}) ${consultationTime}</p>
          <p><strong>학생 이메일:</strong> ${studentEmail}</p>
        </div>
      </div>
    `,
  });
}