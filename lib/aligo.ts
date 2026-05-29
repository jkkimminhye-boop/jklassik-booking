import axios from 'axios';

const ALIGO_BASE_URL = 'https://apis.aligo.in';
const ALIGO_API_KEY = process.env.ALIGO_API_KEY || '';
const ALIGO_USER_ID = process.env.ALIGO_USER_ID || '';
const ALIGO_SENDER = '01094101577'; // 발신번호

interface AligoSendParams {
  receiver: string; // 수신자 번호 (010-1234-5678 형식)
  message: string; // 메시지 내용 (90글자 이상 메시지 시 분할 처리)
  msg_type?: 'CTA' | 'CTB' | 'CTC'; // 카톡(CTA), 친구톡(CTB), 알림톡(CTC) - 기본값 CTA(카톡)
  template_code?: string; // 알림톡 템플릿 코드 (msg_type이 CTC일 때)
  failover?: 'Y' | 'N'; // 실패 시 SMS로 자동 대체 (기본값 Y)
}

/**
 * 알리고문자 API를 통해 카톡/SMS 발송
 * 카톡 실패 시 자동으로 SMS로 전환됨
 */
export async function sendAligoMessage(params: AligoSendParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!ALIGO_API_KEY || !ALIGO_USER_ID) {
      console.warn('알리고 API 키가 설정되지 않았습니다.');
      return { success: false, error: 'API 키 미설정' };
    }

    const response = await axios.post(`${ALIGO_BASE_URL}/send/`, {
      user_id: ALIGO_USER_ID,
      key: ALIGO_API_KEY,
      receiver: params.receiver.replace(/-/g, ''), // 하이픈 제거
      sender: ALIGO_SENDER, // 발신번호
      msg: params.message,
      msg_type: params.msg_type || 'CTA', // 기본값: 카톡
      failover: params.failover !== 'N' ? 'Y' : 'N', // 기본값: SMS 자동 대체
    });

    if (response.data.result_code === '1') {
      return {
        success: true,
        messageId: response.data.msg_id,
      };
    } else {
      return {
        success: false,
        error: response.data.result_message || '메시지 발송 실패',
      };
    }
  } catch (error) {
    console.error('알리고 API 요청 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

/**
 * 예약 완료 후 학생에게 자동 문자 발송
 */
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
    msg_type: 'CTA', // 카톡
    failover: 'Y', // SMS 자동 대체
  });
}

/**
 * 예약 취소 안내 문자 발송
 */
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
    msg_type: 'CTA',
    failover: 'Y',
  });
}