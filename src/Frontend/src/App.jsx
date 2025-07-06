import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import GraduationRequirementsPage from './pages/GraduationRequirementsPage'; // 페이지 import
import { useAuth } from './context/AuthContext';
import './App.css';
import Logo from './components/Logo';

// 로그아웃 버튼을 위한 별도 컴포넌트
function LogoutButton() {
  const { logoutAction } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAction();
    navigate('/login');
  };

  return <button onClick={handleLogout} className="nav-button">로그아웃</button>;
}

function App() {
  const { token } = useAuth(); // 토큰 상태 가져오기

  return (
    <BrowserRouter>
      <div className="container">
        <div className="top-bar">
          <nav className="auth-nav">
            {token ? (
              <>
                <Link to="/mypage" className="nav-button">마이페이지</Link>
                {/* 졸업요건 페이지 이동 버튼 추가 */}
                <Link to="/requirements" className="nav-button">졸업요건</Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link to="/login" className="nav-button">로그인</Link>
                <Link to="/signup" className="nav-button">회원가입</Link>
              </>
            )}
          </nav>
        </div>
        <header>
          <div className="header-content">
            <Link to="/" className="header-title-link">
              <div className="brand-section">
                <Logo size={60} className="header-logo" />
                <h1 className="header-title">Campus Compass</h1>
              </div>
            </Link>
            <p className="description">최적의 수강 계획을 위한 강의 추천 시스템</p>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          {/* 졸업요건 페이지 라우트 추가 */}
          <Route path="/requirements" element={<GraduationRequirementsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
