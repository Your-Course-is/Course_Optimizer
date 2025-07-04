import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function GraduationRequirementsPage() {
  const { token } = useAuth();
  const [takenCourses, setTakenCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 데이터 로딩 함수
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [takenRes, allRes] = await Promise.all([
        fetch('http://localhost:5001/api/user/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5001/api/courses/all')
      ]);
      const takenData = await takenRes.json();
      const allData = await allRes.json();
      setTakenCourses(takenData);
      setAllCourses(allData);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // 과목 추가 핸들러
  const handleAddCourse = async (courseId) => {
    try {
      const response = await fetch('http://localhost:5001/api/user/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ course_id: courseId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await fetchData(); // 목록 새로고침
      setSearchTerm(''); // 검색창 초기화
    } catch (error) {
      alert(error.message);
    }
  };

  // 과목 삭제 핸들러
  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    try {
      const response = await fetch(`http://localhost:5001/api/user/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('삭제 실패');
      await fetchData(); // 목록 새로고침
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredCourses = searchTerm
    ? allCourses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !takenCourses.some(tc => tc.id === course.id) // 이미 이수한 과목은 제외
      ).slice(0, 5) // 최대 5개만 보여줌
    : [];

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="requirements-container">
      <h2>졸업요건 관리</h2>
      
      <div className="requirements-section">
        <h3>이수 내역 추가</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="과목명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="course-search-input"
          />
          {filteredCourses.length > 0 && (
            <ul className="search-results">
              {filteredCourses.map(course => (
                <li key={course.id} onClick={() => handleAddCourse(course.id)}>
                  {course.name} ({course.professor})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="requirements-section">
        <h3>나의 이수 현황 ({takenCourses.length}과목)</h3>
        <ul className="taken-courses-list">
          {takenCourses.length > 0 ? takenCourses.map(course => (
            <li key={course.id}>
              <span>{course.name} ({course.category})</span>
              <button onClick={() => handleRemoveCourse(course.id)} className="remove-btn">삭제</button>
            </li>
          )) : <p>아직 이수한 과목이 없습니다.</p>}
        </ul>
      </div>
    </div>
  );
}