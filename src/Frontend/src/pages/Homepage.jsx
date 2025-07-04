import { useAuth } from '../context/AuthContext';
import GraduationProgressCard from '../components/GraduationProgressCard';
import RecommendedCourses from '../components/RecommendedCourses';
import '../App.css';

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
  const { user } = useAuth();
  const userName = user ? user.email : '사용자';

  return (
    <div className="dashboard">
      <h2>{userName}님을 위한 대시보드</h2>
      <GraduationProgressCard />
      <RecommendedCourses />
      {/* 여기에 다른 대시보드 카드(알림, 피드백 등)를 추가할 수 있습니다. */}
    </div>
  );
}

export default function HomePage() {
  const { token } = useAuth();

  return (
    <main>
      {token ? <Dashboard /> : <PublicHomePage />}
    </main>
  );
}
