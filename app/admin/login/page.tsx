'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: 실제 로그인 구현 (Supabase Auth 또는 간단한 토큰 인증)
      // 현재는 하드코딩된 계정으로 테스트
      if (email === 'admin@jklassik.com' && password === 'admin123') {
        localStorage.setItem('admin_token', 'admin_' + Date.now());
        router.push('/admin/dashboard');
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-3xl">J</div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">JKLASSIK</h1>
        <p className="text-center text-gray-600 text-sm mb-8">관리자 로그인</p>

        <form onSubmit={handleLogin}>
          {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jklassik.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 text-white py-2 rounded-lg font-semibold hover:bg-red-800 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded text-xs text-blue-800">
          <strong>테스트 계정:</strong>
          <div>이메일: admin@jklassik.com</div>
          <div>비밀번호: admin123</div>
        </div>
      </div>
    </div>
  );
}
