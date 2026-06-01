import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBookingConfirmationMessage } from '@/lib/aligo';
import { generateBookingNo, generateToken, formatDate } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_name, phone_number, email, education_level, major, consultation_content, consultation_date, consultation_time } = body;

    if (!student_name || !phone_number || !consultation_date || !consultation_time) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    const bookingNo = generateBookingNo(new Date());
    const token = generateToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 30);

    const { data, error } = await supabase.from('bookings').insert([{
      booking_no: bookingNo,
      student_name,
      phone_number,
      email,
      education_level,
      major,
      consultation_content,
      consultation_date,
      consultation_time,
      status: 'pending',
      token,
      token_expires_at: tokenExpires.toISOString(),
    }]);

    if (error) {
      console.error('DB 저장 실패:', error);
      return NextResponse.json({ error: '예약 저장에 실패했습니다.' }, { status: 500 });
    }

    const cancelManageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://booking.jklassik.com'}/manage?token=${token}`;

    const smsResult = await sendBookingConfirmationMessage(phone_number, bookingNo, consultation_date, consultation_time, cancelManageUrl);

    if (!smsResult.success) {
      console.warn('알리고 메시지 발송 실패:', smsResult.error);
    }

    return NextResponse.json({
      success: true,
      booking_no: bookingNo,
      message: '예약이 완료되었습니다.',
    });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}