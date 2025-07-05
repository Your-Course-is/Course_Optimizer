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

      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [token]);

  // 이수하지 않은 과목만 필터링 (이 부분이 빠졌을 수 있음!)
  const availableCourses = allCourses.filter(course => 
    !takenCourses.some(taken => taken.id === course.id)
  );

  // 선택 가능한 과목이 변경될 때 selectedCourseId 업데이트
  useEffect(() => {
    if (availableCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(availableCourses[0].id);
    } else if (availableCourses.length === 0) {
      setSelectedCourseId('');
    } else if (selectedCourseId && !availableCourses.some(course => course.id === parseInt(selectedCourseId))) {
      setSelectedCourseId(availableCourses[0].id);
    }
  }, [availableCourses, selectedCourseId]);

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
      setError('');
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
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // 총 이수 학점 계산
  const totalCredits = takenCourses.reduce((sum, c) => sum + (c.credit || 0), 0);

  // takenCourses를 구분(category)별로 그룹화
  const groupedByCategory = takenCourses.reduce((acc, course) => {
    if (!acc[course.category]) acc[course.category] = [];
    acc[course.category].push(course);
    return acc;
  }, {});

  // 상세한 졸업 진행도 컴포넌트
  const DetailedGraduationProgress = ({ takenCourses }) => {
    const requirements = {
      total: 130,
      '전공기초': 15,
      '전공필수': 30,
      '전공선택': 30,
      '교양필수': 15,
      '교양선택': 15,
    };

    const calculateCredits = (category) => {
      if (category === 'total') {
        return takenCourses.reduce((sum, course) => sum + (course.credit || 0), 0);
      }
      return takenCourses
        .filter(course => course.category === category)
        .reduce((sum, course) => sum + (course.credit || 0), 0);
    };

    const getProgressPercentage = (current, required) => {
      return Math.min((current / required) * 100, 100);
    };

    const ProgressBar = ({ label, current, required, color, isTotal = false }) => {
      const percentage = getProgressPercentage(current, required);
      const isCompleted = current >= required;

      return (
        <div className={`detailed-progress-item ${isTotal ? 'total-progress' : ''}`}>
          <div className="progress-header">
            <span className="progress-label">
              {isCompleted ? '✅' : '📚'} {label}
            </span>
            <span className="progress-text">
              {current} / {required} 학점
            </span>
          </div>
          <div className="progress-bar-container">
            <div 
              className={`progress-bar ${isCompleted ? 'completed' : ''}`}
              style={{ 
                width: `${percentage}%`,
                backgroundColor: color 
              }}
            >
              <span className="progress-percentage">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      );
    };

    const totalCredits = calculateCredits('total');

    return (
      <div className="detailed-graduation-progress">
        <div className="progress-header-section">
          <h3>🎓 상세 졸업 진행도</h3>
          <div className="overall-summary">
            전체 진행률: {((totalCredits / requirements.total) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="progress-list">
          <ProgressBar 
            label="전체 이수학점" 
            current={totalCredits} 
            required={requirements.total}
            color="#3b82f6"
            isTotal={true}
          />
          
          {Object.entries(requirements).map(([category, required]) => {
            if (category === 'total') return null;
            
            const current = calculateCredits(category);
            const colors = {
              '전공기초': '#10b981',
              '전공필수': '#ef4444',
              '전공선택': '#f59e0b',
              '교양필수': '#8b5cf6',
              '교양선택': '#06b6d4'
            };
            
            return (
              <ProgressBar 
                key={category}
                label={category} 
                current={current} 
                required={required}
                color={colors[category] || '#6b7280'}
              />
            );
          })}
        </div>

        <div className="graduation-status">
          {totalCredits >= requirements.total ? (
            <div className="status-message completed">
              🎉 졸업 요건을 모두 충족했습니다!
            </div>
          ) : (
            <div className="status-message">
              💪 졸업까지 {requirements.total - totalCredits}학점 더 필요합니다
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main>
      <h2>졸업요건 및 이수현황 관리</h2>
      {error && <p className="error-message">{error}</p>}
      
      {/* 상세한 졸업요건 진행도 */}
      <DetailedGraduationProgress takenCourses={takenCourses} />

      {/* 이수 과목 관리 */}
      <div className="dashboard-card">
        <h3>이수 과목 추가</h3>
        {availableCourses.length > 0 ? (
          <form onSubmit={handleAddCourse} className="add-course-form">
            <select 
              value={selectedCourseId} 
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {availableCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.category}) · {course.credit}학점
                </option>
              ))}
            </select>
            <button type="submit">추가하기</button>
          </form>
        ) : (
          <p>추가할 수 있는 과목이 없습니다.</p>
        )}
      </div>

      <div className="dashboard-card">
        <h3>나의 이수 내역</h3>
        <ul className="taken-courses-list">
          {takenCourses.map(course => (
            <li key={course.id}>
              <span>
                {course.name} ({course.category}) <b style={{color:'#888'}}>· {course.credit}학점</b>
              </span>
              <button onClick={() => handleDeleteCourse(course.id)} className="delete-btn">삭제</button>
            </li>
          ))}
        </ul>
        {takenCourses.length === 0 && <p>아직 이수한 과목이 없습니다.</p>}
      </div>

      <div className="dashboard-card">
        <h3>구분별 이수 과목 현황</h3>
        {Object.keys(groupedByCategory).length === 0 && <p>아직 이수한 과목이 없습니다.</p>}
        {Object.entries(groupedByCategory).map(([category, courses]) => (
          <div key={category} style={{marginBottom: '1em'}}>
            <b>{category} ({courses.length}과목, {courses.reduce((sum, c) => sum + (c.credit || 0), 0)}학점)</b>
            <ul style={{marginLeft: '1em'}}>
              {courses.map(course => (
                <li key={course.id}>
                  {course.name}
                  <span style={{color:'#888'}}>
                    ({course.credit}학점, {course.semester}학기)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
