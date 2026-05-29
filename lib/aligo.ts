import axios from 'axios';

const PROXY_URL = 'https://aligo-proxy-production-b963.up.railway.app';
const SECRET_KEY = process.env.SECRET_KEY || '';

export async function sendAligoMessage(params: {
  receiver: string;
  message: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await axios.post(
      `${PROXY_URL}/send-message`,
      {
        phone: params.receiver,
        message: params.message,
      },
      {
        headers: {
          'x-secret-key': SECRET_KEY,
        },
      }
    );

    console.log('프록시 응답:', response.data);

    if (response.data.result_code === '1') {
      return { success: true, messageId: response.data.msg_id };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    console.error('프록시 요청 실패:', error);
    return { success: false, error: '문자 발송 실패' };
  }
}

export async function sendBookingConfirmationMessage(
  phoneNumber: string,
  bookingNo: string,
  consultationDate: string,
  consultationTime: string,
  cancelManageUrl: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const dateObj = new Date(consultationDate);
  const monthDay = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
  const dow = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];

  const message = `[제이클래식]
예약이 완료되었습니다.

예약번호: ${bookingNo}
상담 일시: ${monthDay}(${dow}) ${consultationTime}

예약 후 담당자의 두번째 문자 혹은 전화를 받아야 상담이 확정됩니다.

취소/변경: ${cancelManageUrl}`;

  return sendAligoMessage({
    receiver: phoneNumber,
    message,
  });
}

export async function sendCancellationMessage(
  phoneNumber: string,
  bookingNo: string,
  consultationDate: string,
  consultationTime: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const dateObj = new Date(consultationDate);
  const monthDay = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
  const dow = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];

  const message = `[제이클래식]
예약이 취소되었습니다.

예약번호: ${bookingNo}
취소된 상담: ${monthDay}(${dow}) ${consultationTime}

새로운 일정으로 다시 예약하고 싶으신 경우, 저희에게 문의해주세요.`;

  return sendAligoMessage({
    receiver: phoneNumber,
    message,
  });
}