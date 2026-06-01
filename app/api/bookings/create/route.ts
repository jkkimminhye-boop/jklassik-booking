if (!smsResult.success) {
  console.warn('알리고 메시지 발송 실패:', smsResult.error);
}

// 이메일 발송 ← 여기!
if (email) {
  try {
    await sendBookingConfirmationEmail(
      email,
      student_name,
      bookingNo,
      consultation_date,
      consultation_time,
      cancelManageUrl
    );
  } catch (emailError) {
    console.warn('이메일 발송 실패:', emailError);
  }
}

return NextResponse.json({  // ← return은 이메일 발송 후에!
  success: true,
  booking_no: bookingNo,
  message: smsResult.success ? '예약이 완료되었습니다.' : '예약이 완료되었으나 문자 발송에 실패했습니다.',
});
} catch (error) {
console.error('API 오류:', error);
return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
}
}