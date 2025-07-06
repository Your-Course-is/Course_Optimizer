import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
  const { token, user, setUser, logoutAction } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    department: '',
    year: '',
    email: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 초기 사용자 정보 로딩
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // 사용자 정보 로딩
    fetch('http://localhost:5001/api/user/info', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('사용자 정보를 불러오는데 실패했습니다.');
      }
      return response.json();
    })
    .then(data => {
      setUserInfo({
        name: data.name || '',
        department: data.department || '',
        year: data.year || '',
        email: data.email || ''
      });
      setUser(data); // 전역 사용자 정보도 업데이트
      setLoading(false);
    })
    .catch(err => {
      console.error('사용자 정보 로딩 실패:', err);
      setError(err.message);
      setLoading(false);
    });
  }, [token, navigate, setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 사용자 정보 업데이트 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. 먼저 response가 ok인지 확인
      const response = await fetch('http://localhost:5001/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userInfo.name,
          department: userInfo.department,
          year: parseInt(userInfo.year) // 문자열을 숫자로 변환
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '정보 수정에 실패했습니다.');
      }

      // 2. 성공시 사용자 정보 업데이트
      setUser(prev => ({
        ...prev,
        name: userInfo.name,
        department: userInfo.department,
        year: parseInt(userInfo.year)
      }));
      
      setIsEditing(false);
      alert('정보가 성공적으로 수정되었습니다.');
    } catch (err) {
      console.error('Error updating user info:', err);
      setError(err.message || '서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  // 편집 모드 시작시 현재 사용자 정보로 폼 초기화
  const startEditing = () => {
    setUserInfo({
      name: user.name || '',
      department: user.department || '',
      year: user.year || '',
      email: user.email || ''
    });
    setIsEditing(true);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="mypage-container">
      <h2>마이페이지</h2>
      {error && <p className="error-message">{error}</p>}
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="user-info-form">
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={userInfo.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div className="form-group">
            <label>학과</label>
            <input
              type="text"
              name="department"
              value={userInfo.department}
              onChange={handleInputChange}
              placeholder="학과를 입력하세요"
            />
          </div>
          <div className="form-group">
            <label>학년</label>
            <select name="year" value={userInfo.year} onChange={handleInputChange}>
              <option value="">학년 선택</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
              <option value="4">4학년</option>
            </select>
          </div>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={userInfo.email}
              onChange={handleInputChange}
              disabled
            />
          </div>
          <div className="button-group">
            <button type="submit">저장</button>
            <button type="button" onClick={() => setIsEditing(false)}>취소</button>
          </div>
        </form>
      ) : (
        <div className="user-info-display">
          <p><strong>이름:</strong> {user.name || '미입력'}</p>
          <p><strong>학과:</strong> {user.department || '미입력'}</p>
          <p><strong>학년:</strong> {user.year ? `${user.year}학년` : '미입력'}</p>
          <p><strong>이메일:</strong> {user.email}</p>
          <button onClick={startEditing}>정보 수정</button>
        </div>
      )}
    </div>
  );
}