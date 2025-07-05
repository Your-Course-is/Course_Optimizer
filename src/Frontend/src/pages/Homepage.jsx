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
  const userName = user ? user.email : '사용자';
  const [takenCourses, setTakenCourses] = useState([]);
  const [userInfo, setUserInfo] = useState({ year: 2, major: '' });

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
      return Promise.all([infoRes.json(), coursesRes.json()]);
    }).then(([info, courses]) => {
      setUserInfo(info);
      if (Array.isArray(courses)) setTakenCourses(courses);
    }).catch(error => {
      console.error('데이터 조회 실패:', error);
      setUserInfo({ year: 2, major: '' });
      setTakenCourses([]);
    });
  }, [token]);

  return (
    <div className="dashboard">
      <h2>{userInfo.year}학년 {userName}님의 대시보드</h2>
      <GraduationProgressCard takenCourses={takenCourses} />
      <RecommendedCourses takenCourses={takenCourses} userYear={userInfo.year} />
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
