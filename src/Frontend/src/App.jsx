import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <div className="top-bar">
          <nav className="auth-nav">
            <Link to="/login" className="nav-button">로그인</Link>
            <Link to="/signup" className="nav-button">회원가입</Link>
          </nav>
        </div>
        <header>
          <Link to="/" className="header-title-link">
            <h1>Campus Compass</h1>
          </Link>
          <p className="description">최적의 수강 계획을 위한 강의 추천 시스템</p>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;