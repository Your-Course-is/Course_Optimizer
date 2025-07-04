import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="auth-container">
      <h2>로그인</h2>
      <form className="auth-form">
        <input type="email" placeholder="이메일" required />
        <input type="password" placeholder="비밀번호" required />
        <button type="submit">로그인</button>
      </form>
      <p>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}