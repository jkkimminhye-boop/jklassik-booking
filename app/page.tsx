'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ALL_SLOTS, AM_SLOTS, formatDate, getMonday, isHoliday, isBookingOpen, getDayName, generateBookingNo, generateToken } from '@/lib/constants';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export default function BookingPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    educationLevel: '',
    major: '',
    consultationContent: '',
  });
  const [takenSlots, setTakenSlots] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadTakenSlots();
  }, []);

  const loadTakenSlots = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 60);

    const { data } = await supabase
      .from('bookings')
      .select('consultation_date, consultation_time')
      .gte('consultation_date', formatDate(today))
      .lte('consultation_date', formatDate(futureDate))
      .eq('status', 'pending');

    const taken: Record<string, string[]> = {};
    data?.forEach((booking) => {
      if (!taken[booking.consultation_date]) {
        taken[booking.consultation_date] = [];
      }
      taken[booking.consultation_date].push(booking.consultation_time);
    });
    setTakenSlots(taken);
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    setLoading(true);

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: formData.name,
          phone_number: formData.phone,
          email: formData.email,
          education_level: formData.educationLevel,
          major: formData.major,
          consultation_content: formData.consultationContent,
          consultation_date: formatDate(selectedSlot.date),
          consultation_time: selectedSlot.time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '예약 실패');
      }

      setStep(3);
    } catch (error) {
      console.error('예약 실패:', error);
      alert('예약 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + weekOffset * 7);

    const days = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });

    const dateRange = `${days[0].getMonth() + 1}-${String(days[0].getDate()).padStart(2, '0')} ~ ${days[4].getMonth() + 1}-${String(days[4].getDate()).padStart(2, '0')}`;

    return (
      <div className="bg-white rounded-lg p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} className="p-2 border rounded">
            ←
          </button>
          <div className="font-semibold">{dateRange}</div>
          <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 border rounded">
            →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right pr-2 py-2">시간</th>
                {days.map((d) => (
                  <th key={formatDate(d)} className="text-center py-2 px-2 min-w-20 border-b">
                    {d.getMonth() + 1}-{String(d.getDate()).padStart(2, '0')} {DOW[d.getDay()]}
                    {formatDate(d) === formatDate(today) && <div className="text-xs text-red-600">오늘</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_SLOTS.map((slot) => (
                <tr key={slot} className="border-b">
                  <td className="text-right pr-2 py-2 text-gray-600 font-semibold">{slot}</td>
                  {days.map((d) => {
                    const ds = formatDate(d);
                    const isHol = isHoliday(d);
                    const isTaken = takenSlots[ds]?.includes(slot);
                    const open = isBookingOpen(d, slot, now);
                    const isPast = (() => {
                      // 과거 날짜 또는 오늘
                      if (d <= today) return true;
                    
                      // 해당 날짜+시간이 현재시각+24시간 이내면 마감
                      const [slotHour, slotMin] = slot.split(':').map(Number);
                      const slotDateTime = new Date(d);
                      slotDateTime.setHours(slotHour, slotMin, 0, 0);
                      
                      const deadline = new Date(now);
                      deadline.setHours(deadline.getHours() + 24);
                      
                      if (slotDateTime < deadline) return true;
                      
                      // 월요일인 경우: 전주 금요일 오후 6시 이후면 마감
                      if (d.getDay() === 1) {
                        const lastFriday = new Date(d);
                        lastFriday.setDate(d.getDate() - 3);
                        lastFriday.setHours(18, 0, 0, 0);
                        if (now > lastFriday) return true;
                      }
                      
                      return false;
                    })();
                    let bgColor = 'bg-gray-300 text-white';
                    let disabled = true;

                    if (!isHol && !isPast && !isTaken && open) {
                      bgColor = 'bg-pink-100 border-2 border-pink-300 text-pink-800 cursor-pointer hover:bg-pink-200';
                      disabled = false;
                    } else if (isTaken) {
                      bgColor = 'bg-gray-200 text-gray-600 line-through';
                    } else if (isPast || isHol) {
                      bgColor = 'bg-gray-300 text-white';
                    } else {
                      bgColor = 'bg-gray-300 text-white';
                    }

                    return (
                      <td key={`${ds}-${slot}`} className="text-center p-1">
                        <button
                          disabled={disabled}
                          onClick={() => {
                            setSelectedSlot({ date: d, time: slot });
                            setStep(2);
                          }}
                          className={`w-full py-2 rounded text-xs font-semibold ${bgColor} ${disabled ? 'cursor-not-allowed' : ''}`}
                        >
                          {isTaken ? '예약종료' : isPast || isHol ? '마감' : '예약가능'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-lg">J</div>
              <div>
                <div className="font-semibold">JKLASSIK</div>
                <div className="text-xs text-gray-600">베를린 본사, 서울지사 독일전문유학원</div>
              </div>
              <div className="ml-auto text-xs bg-red-50 text-red-700 border border-red-300 rounded-full px-3 py-1">시원스쿨 인증</div>
            </div>

            <div className="mb-6">
              <div className="text-xs text-red-700 font-semibold">시원스쿨 학생 전용</div>
              <div className="text-2xl font-bold mb-2">
                가장 많은 유학생이 찾는 독일전문유학원, <span className="text-red-700">제이클래식</span>
              </div>
              <div className="text-gray-600">서울지사 입시상담 담당자가 1:1 화상으로 30분간 무료 상담합니다.</div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: '🏢', title: '베를린 본사', sub: '독일유학 전문' },
                { icon: '🎓', title: '입시상담', sub: '독일유학 특징, 지원자격' },
                { icon: '💼', title: '수속상담', sub: '숙소, 비자, 보험' },
              ].map((card, i) => (
                <div key={i} className="bg-gray-100 rounded p-4 text-center">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <div className="font-semibold text-sm">{card.title}</div>
                  <div className="text-xs text-gray-600">{card.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {renderCalendar()}

          <div className="bg-gray-100 rounded p-4 mt-4 text-xs text-gray-700">
            <div className="font-semibold mb-2">예약 정책</div>
            <div className="mb-2">· 예약 후 담당자 문자·전화를 받아야 상담이 확정됩니다.</div>
            <div>· 취소·변경은 영업일 기준 1일 전까지 받으신 메시지 링크를 클릭하여 하실 수 있습니다.</div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 rounded p-3 mb-6 text-sm text-red-700 font-semibold">
            {selectedSlot?.date.getMonth()! + 1}월 {selectedSlot?.date.getDate()}일 ({DOW[selectedSlot?.date.getDay()!]}) {selectedSlot?.time} — 30분 화상상담
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="이름"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-1 p-2 border rounded"
              />
              <input
                type="tel"
                placeholder="전화번호"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-1 p-2 border rounded"
              />
              <input
                type="email"
                placeholder="이메일"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-2 p-2 border rounded"
              />
              <select
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                className="col-span-1 p-2 border rounded"
              >
                <option>최종학력</option>
                <option>고등학교 졸업(예정)</option>
                <option>대학교 재학</option>
                <option>대학교 졸업(예정)</option>
                <option>대학원 재학</option>
                <option>대학원 졸업(예정)</option>
              </select>
              <input
                type="text"
                placeholder="전공"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="col-span-1 p-2 border rounded"
              />
              <textarea
                placeholder="상담 내용"
                value={formData.consultationContent}
                onChange={(e) => setFormData({ ...formData, consultationContent: e.target.value })}
                className="col-span-2 p-2 border rounded h-24"
              />
            </div>

            <div className="bg-orange-50 border border-orange-300 rounded p-3 text-xs text-orange-800 mb-4">
              예약 후 자동문자가 발송됩니다. 이후 담당자의 두번째 문자 혹은 전화를 받아야 상담이 확정됩니다.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-2 border rounded bg-white">
                이전
              </button>
              <button
                onClick={handleBooking}
                disabled={loading || !formData.name || !formData.phone}
                className="flex-1 py-2 bg-red-700 text-white rounded font-semibold disabled:opacity-50"
              >
                {loading ? '처리 중...' : '예약 신청하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg p-8 text-center max-w-md">
        <div className="text-5xl text-red-700 mb-4">✓</div>
        <div className="text-2xl font-bold mb-2">예약이 완료되었습니다</div>
        <div className="text-gray-600 mb-6">입력하신 전화번호로 문자(카톡 또는 SMS)를 보내드립니다.</div>
        <div className="bg-gray-100 rounded p-4 text-left text-sm mb-6">
          <div className="font-semibold text-red-700 mb-2">JK-20260602-0042</div>
          <div className="mb-2">{selectedSlot?.date.getMonth()! + 1}월 {selectedSlot?.date.getDate()}일 ({DOW[selectedSlot?.date.getDay()!]}) {selectedSlot?.time}</div>
          <div className="mb-2">{formData.name}</div>
          <div>{formData.phone}</div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2 bg-red-700 text-white rounded font-semibold"
        >
          처음으로
        </button>
      </div>
    </div>
  );
}