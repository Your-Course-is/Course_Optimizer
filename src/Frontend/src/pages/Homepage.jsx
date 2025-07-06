import { useAuth } from '../context/AuthContext';
import GraduationProgressCard from '../components/GraduationProgressCard';
import RecommendedCourses from '../components/RecommendedCourses';
import '../App.css';
import { useEffect, useState } from 'react';

// 로그인하지 않은 사용자를 위한 컴포넌트
function PublicHomePage() {
  return (
    <div className="public-welcome">
      <h2>Campus Compass에 오신 것을 환영합니다!</h2>
      <p>최적의 수강 계획을 위한 개인 맞춤형 강의 추천 시스템입니다.</p>
      <p>로그인하고 맞춤형 추천을 받아보세요.</p>
    </div>
  );
}

// 로그인한 사용자를 위한 대시보드 컴포넌트
function Dashboard() {
  const { user, token } = useAuth();
  const [takenCourses, setTakenCourses] = useState([]);
  const [userInfo, setUserInfo] = useState({ 
    year: '',
    name: '',
    department: '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (!token) return;
    
    Promise.all([
      fetch('http://localhost:5001/api/user/info', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      }),
      fetch('http://localhost:5001/api/user/courses', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
    ]).then(([infoRes, coursesRes]) => {
      if (!infoRes.ok || !coursesRes.ok) {
        throw new Error('데이터 조회에 실패했습니다.');
      }
      return Promise.all([infoRes.json(), coursesRes.json()]);
    }).then(([info, courses]) => {
      // year를 숫자로 변환하여 저장
      setUserInfo({
        year: parseInt(info.year) || '',  // 문자열을 숫자로 변환
        name: info.name || user?.email || '사용자',
        department: info.department || '',
        email: info.email || user?.email || ''
      });
      if (Array.isArray(courses)) setTakenCourses(courses);
    }).catch(error => {
      console.error('데이터 조회 실패:', error);
      setUserInfo({
        year: '',
        name: user?.email || '사용자',
        department: '',
        email: user?.email || ''
      });
      setTakenCourses([]);
    });
  }, [token, user]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>
          {userInfo.year ? `${userInfo.year}학년 ` : ''}
          {userInfo.name}
          님의 대시보드
        </h2>
      </div>
      
      <GraduationProgressCard takenCourses={takenCourses} />
      <RecommendedCourses 
        takenCourses={takenCourses} 
        userYear={parseInt(userInfo.year) || null}
      />
    </div>
  );
}


// 기본 export (가장 중요!)
export default function HomePage() {
  const { token } = useAuth();

  return (
    <main>
      {token ? <Dashboard /> : <PublicHomePage />}
    </main>
  );
}
