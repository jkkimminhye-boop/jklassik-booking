import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBookingConfirmationMessage } from '@/lib/aligo';
import { generateBookingNo, generateToken, formatDate } from '@/lib/constants';
import { sendBookingConfirmationEmail } from '@/lib/email';

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

    if (!student_name || !phone_number || !email || !consultation_date || !consultation_time) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    const bookingNo = generateBookingNo(new Date());
    const token = generateToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 30);

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
      console.error('DB 저장 실패:',