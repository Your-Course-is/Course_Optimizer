import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RecommendedCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchRecommendedCourses = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('추천 강의를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, [token]);

  if (loading) {
    return <div className="dashboard-card"><p>추천 강의를 불러오는 중입니다...</p></div>;
  }

  if (error) {
    return <div className="dashboard-card"><p style={{color: 'red'}}>{error}</p></div>;
  }

  return (
    <div className="dashboard-card">
      <h3>다음 학기 추천 강의</h3>
      {courses.length > 0 ? (
        <div className="course-list">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <h4>{course.name}</h4>
              <p>{course.professor} 교수님 | {course.category}</p>
              <p style={{fontSize: '0.8em', color: '#888', marginTop: '8px'}}>
                <strong>필수 선수과목:</strong> {course.required_prerequisites.join(', ') || '없음'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>아직 추천 강의가 없습니다. 이수 내역을 입력하면 더 정확한 추천을 받을 수 있습니다.</p>
      )}
    </div>
  );
}