'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type BookingData = {
  id: number;
  booking_no: string;
  student_name: string;
  phone_number: string;
  consultation_date: string;
  consultation_time: string;
  status: string;
  token_expires_at: string;
};

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export default function ManagePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [state, setState] = useState<'loading' | 'found' | 'expired' | 'notfound'>('loading');
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setState('notfound');
      return;
    }

    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        setState('notfound');
        return;
      }

      // 토큰 만료 확인
      if (new Date(data.token_expires_at) < now) {
        setState('expired');
        return;
      }

      setBooking(data);
      setState('found');
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      setState('notfound');
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      setCancelled(true);
      setShowCancelModal(false);
    } catch (error) {
      console.error('취소 실패:', error);
      alert('취소 처리 중 오류가 발생했습니다.');
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">예약 정보 확인 중...</div>
          <div className="text-gray-600">잠시만 기다려주세요.</div>
        </div>
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <div className="text-2xl font-bold mb-2">유효하지 않은 접근입니다</div>
          <div className="text-gray-600 mb-6">이 링크는 더 이상 유효하지 않습니다.</div>
          <a href="/" className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  if (state === 'notfound') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">📭</div>
          <div className="text-2xl font-bold mb-2">예약을 찾을 수 없습니다</div>
          <div className="text-gray-600 mb-6">만료되었거나 이미 취소된 예약일 수 있습니다.</div>
          <a href="/" className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="text-5xl text-red-600 mb-4">✕</div>
          <div className="text-2xl font-bold mb-2">예약이 취소되었습니다</div>
          <div className="text-gray-600 mb-6">
            {booking?.consultation_date.slice(5).replace('-', '월 ')}일 ({DOW[new Date(booking?.consultation_date!).getDay()]}) {booking?.consultation_time} 예약이 취소되었습니다.
          </div>
          <a href="/" className="inline-block bg-red-700 text-white px-6 py-2 rounded font-semibold">
            새 예약하기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-lg">J</div>
            <div>
              <div className="font-semibold">JKLASSIK</div>
              <div className="text-xs text-gray-600">베를린 본사, 서울지사 독일전문유학원</div>
            </div>
          </div>

          <div className="text-2xl font-bold mb-2">📋 예약 내역</div>
          <div className="text-gray-600 mb-6">아래에서 예약을 취소하거나 일정을 변경할 수 있습니다.</div>

          {booking && (
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-sm text-gray-600">예약번호</div>
                  <div className="text-lg font-bold text-red-700">{booking.booking_no}</div>
                </div>
                <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded">신청 완료</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">이름</span>
                  <span className="font-semibold">{booking.student_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">전화번호</span>
                  <span className="font-semibold">{booking.phone_number}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">상담 일시</span>
                  <span className="font-semibold">
                    {booking.consultation_date.slice(5).replace('-', '월 ')}일 ({DOW[new Date(booking.consultation_date).getDay()]}) {booking.consultation_time} — 30분
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">취소·변경 마감</span>
                  <span className="font-semibold text-green-600">{new Date(booking.token_expires_at).toLocaleDateString('ko-KR')} 자정</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border rounded-lg p-6">
            <div className="font-semibold mb-4">⚠️ 어떻게 하시겠어요?</div>
            <div className="space-y-3 mb-4">
              <button
                onClick={() => {
                  // 캘린더 페이지로 이동하여 새 일정 선택
                  window.location.href = '/';
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200"
              >
                ✎ 일정 변경
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 bg-red-50 text-red-700 border border-red-300 rounded font-semibold hover:bg-red-100"
              >
                ✕ 예약 취소
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-300 rounded p-3 text-xs text-orange-800">
              <strong>📌</strong> 변경 후 담당자가 새 일정으로 연락드립니다.
            </div>
          </div>
        </div>
      </div>

      {/* 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm text-center">
            <div className="text-5xl text-red-700 mb-4">⚠️</div>
            <div className="text-xl font-bold mb-2">정말 취소하시겠습니까?</div>
            <div className="text-gray-600 mb-6 text-sm">
              {booking?.consultation_date.slice(5).replace('-', '월 ')}일 ({DOW[new Date(booking?.consultation_date!).getDay()]}) {booking?.consultation_time} 예약이 취소됩니다.<br />
              이후 담당자가 연락을 드리지 않습니다.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 border rounded bg-white font-semibold"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2 bg-red-700 text-white rounded font-semibold"
              >
                취소 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
