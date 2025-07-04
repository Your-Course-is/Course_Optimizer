import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export default function GraduationRequirementsPage() {
  const { token } = useAuth();
  const [takenCourses, setTakenCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [error, setError] = useState('');

  // Fetch taken courses and all courses
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Fetch taken courses
        const takenRes = await fetch('http://localhost:5001/api/user/courses', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const takenData = await takenRes.json();
        if (!takenRes.ok) throw new Error(takenData.error || '이수 과목 로딩 실패');
        setTakenCourses(takenData);

        // Fetch all courses
        const allRes = await fetch('http://localhost:5001/api/courses/all');
        const allData = await allRes.json();
        if (!allRes.ok) throw new Error(allData.error || '전체 과목 로딩 실패');
        setAllCourses(allData);
        if (allData.length > 0) {
          setSelectedCourseId(allData[0].id);
        }

      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [token]);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      const res = await fetch('http://localhost:5001/api/user/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ course_id: selectedCourseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '과목 추가 실패');
      setTakenCourses([...takenCourses, data.course]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/user/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '과목 삭제 실패');
      }
      setTakenCourses(takenCourses.filter(course => course.id !== courseId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main>
      <h2>졸업요건 및 이수현황 관리</h2>
      {error && <p className="error-message">{error}</p>}
      
      {/* 졸업요건 진행도 (Placeholder) */}
      <div className="dashboard-card">
        <h3>나의 졸업 진행도</h3>
        <p>총 이수 학점: {takenCourses.length * 3} / 130</p>
        {/* 추후에 더 상세한 시각화 컴포넌트로 교체 */}
      </div>

      {/* 이수 과목 관리 */}
      <div className="dashboard-card">
        <h3>이수 과목 추가</h3>
        <form onSubmit={handleAddCourse} className="add-course-form">
          <select 
            value={selectedCourseId} 
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {allCourses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
          <button type="submit">추가하기</button>
        </form>
      </div>

      <div className="dashboard-card">
        <h3>나의 이수 내역</h3>
        <ul className="taken-courses-list">
          {takenCourses.map(course => (
            <li key={course.id}>
              <span>{course.name} ({course.category})</span>
              <button onClick={() => handleDeleteCourse(course.id)} className="delete-btn">삭제</button>
            </li>
          ))}
        </ul>
        {takenCourses.length === 0 && <p>아직 이수한 과목이 없습니다.</p>}
      </div>
    </main>
  );
}