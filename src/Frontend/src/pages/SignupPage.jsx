import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <form className="auth-form">
        <input type="email" placeholder="이메일" required />
        <input type="password" placeholder="비밀번호" required />
        <input type="password" placeholder="비밀번호 확인" required />
        <button type="submit">가입하기</button>
      </form>
      <p>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}