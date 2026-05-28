import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBookingConfirmationMessage } from '@/lib/aligo';
import { generateBookingNo, generateToken, formatDate } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      student_name,
      phone_number,
      email,
      education_level,
      major,
      consultation_content,
      consultation_date,
      consultation_time,
    } = body;

    // 유효성 검증
    if (!student_name || !phone_number || !email || !consultation_date || !consultation_time) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    // 예약번호 및 토큰 생성
    const bookingNo = generateBookingNo(new Date());
    const token = generateToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 30);

    // DB에 예약 저장
    const { data, error } = await supabase.from('bookings').insert([
      {
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
      },
    ]);

    if (error) {
      console.error('DB 저장 실패:', error);
      return NextResponse.json({ error: '예약 저장에 실패했습니다.' }, { status: 500 });
    }

    // 알리고문자 발송
    const cancelManageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://booking.jklassik.com'}/manage?token=${token}`;

    const smsResult = await sendBookingConfirmationMessage(phone_number, bookingNo, consultation_date, consultation_time, cancelManageUrl);

    if (!smsResult.success) {
      console.warn('알리고 메시지 발송 실패:', smsResult.error);
      // SMS 실패해도 예약은 진행됨
    }

    return NextResponse.json({
      success: true,
      booking_no: bookingNo,
      message: smsResult.success ? '예약이 완료되었습니다.' : '예약이 완료되었으나 문자 발송에 실패했습니다.',
    });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
