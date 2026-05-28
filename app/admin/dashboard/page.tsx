'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/constants';

type Booking = {
  id: number;
  booking_no: string;
  student_name: string;
  phone_number: string;
  email: string;
  consultation_date: string;
  consultation_time: string;
  status: string;
  created_at: string;
};

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    // 로그인 확인
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      setBookings(data || []);
    } catch (error) {
      console.error('예약 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);

      if (error) throw error;
      loadBookings();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const filteredBookings = bookings.filter((b) => (filter === 'all' ? true : b.status === filter));

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold">J</div>
            <div>
              <div className="font-semibold">JKLASSIK</div>
              <div className="text-xs text-gray-600">관리자 대시보드</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-700 border border-red-300 rounded font-semibold text-sm"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto p-6">
        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '전체 예약', value: stats.total, color: 'blue' },
            { label: '신청 중', value: stats.pending, color: 'yellow' },
            { label: '확정', value: stats.confirmed, color: 'green' },
            { label: '취소', value: stats.cancelled, color: 'red' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white rounded-lg p-6 border-l-4 border-${stat.color}-500`}>
              <div className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg p-4 mb-6 flex gap-2">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded font-semibold text-sm ${
                filter === f
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '모두' : f === 'pending' ? '신청 중' : f === 'confirmed' ? '확정' : '취소'}
            </button>
          ))}
        </div>

        {/* 예약 목록 */}
        <div className="bg-white rounded-lg overflow-hidden shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-600">로드 중...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-600">예약이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">예약번호</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">학생명</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">연락처</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">상담 일시</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">상태</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">접수일</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-red-700">{booking.booking_no}</td>
                      <td className="px-6 py-4 text-sm">{booking.student_name}</td>
                      <td className="px-6 py-4 text-sm">{booking.phone_number}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(booking.consultation_date).getMonth() + 1}월{' '}
                        {new Date(booking.consultation_date).getDate()}일 (
                        {DOW[new Date(booking.consultation_date).getDay()]}) {booking.consultation_time}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className={`px-3 py-1 rounded font-semibold text-sm border ${
                            booking.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                              : booking.status === 'confirmed'
                                ? 'bg-green-50 text-green-700 border-green-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="pending">신청 중</option>
                          <option value="confirmed">확정</option>
                          <option value="cancelled">취소</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:underline">상세</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
