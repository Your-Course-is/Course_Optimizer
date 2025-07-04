import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
  const { token, user, setUser, logoutAction } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        logoutAction(); // 토큰이 유효하지 않으면 로그아웃 처리
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    if (token && !user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token, user, navigate, setUser, logoutAction]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <div>사용자 정보를 표시할 수 없습니다.</div>;
  }

  return (
    <div className="mypage-container">
      <h2>마이페이지</h2>
      <p>안녕하세요, <strong>{user.email}</strong>님!</p>
      {/* 여기에 졸업요건, 이수 현황 등 추가 예정 */}
    </div>
  );
}