import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function RecommendedCourses({ takenCourses, userYear = 2 }) {
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const getNextSemesterRecommendations = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/next-semester-courses', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            takenCourses: takenCourses || [],
            userYear: userYear || 2 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        } else {
          console.error('추천 데이터 로딩 실패');
          setRecommendations({ required: [], prerequisiteReady: [], electives: [] });
        }
      } catch (error) {
        console.error('추천 시스템 오류:', error);
        setRecommendations({ required: [], prerequisiteReady: [], electives: [] });
      } finally {
        setLoading(false);
      }
    };

    getNextSemesterRecommendations();
  }, [takenCourses, userYear, token]);

  if (loading) {
    return (
      <div className="recommended-courses">
        <h3>다음 학기 추천 강의</h3>
        <div className="loading">추천 강의를 분석하는 중...</div>
      </div>
    );
  }

  const hasAnyRecommendations = 
    (recommendations.required && recommendations.required.length > 0) ||
    (recommendations.prerequisiteReady && recommendations.prerequisiteReady.length > 0) ||
    (recommendations.electives && recommendations.electives.length > 0);

  return (
    <div className="recommended-courses">
      <h3>🎯 다음 학기 추천 강의 ({userYear}학년 기준)</h3>
      
      {!hasAnyRecommendations ? (
        <div className="no-recommendations">
          <p>현재 추천할 수 있는 강의가 없습니다.</p>
          <p>새로운 강의 데이터를 추가하거나 이수 과목을 확인해주세요.</p>
        </div>
      ) : (
        <div className="recommendation-categories">
          
          {/* 필수 과목 */}
          {recommendations.required && recommendations.required.length > 0 && (
            <div className="recommendation-section">
              <h4 className="section-title required-title">
                📋 우선 이수 과목 ({recommendations.required.length}개)
              </h4>
              <div className="course-grid">
                {recommendations.required.map(course => (
                  <CourseRecommendationCard 
                    key={course.id} 
                    course={course} 
                    type="required" 
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* 선수과목 완료 */}
          {recommendations.prerequisiteReady && recommendations.prerequisiteReady.length > 0 && (
            <div className="recommendation-section">
              <h4 className="section-title ready-title">
                ✅ 수강 가능 과목 ({recommendations.prerequisiteReady.length}개)
              </h4>
              <div className="course-grid">
                {recommendations.prerequisiteReady.map(course => (
                  <CourseRecommendationCard 
                    key={course.id} 
                    course={course} 
                    type="ready" 
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* 일반 선택과목 */}
          {recommendations.electives && recommendations.electives.length > 0 && (
            <div className="recommendation-section">
              <h4 className="section-title elective-title">
                📚 추천 선택과목 ({recommendations.electives.length}개)
              </h4>
              <div className="course-grid">
                {recommendations.electives.map(course => (
                  <CourseRecommendationCard 
                    key={course.id} 
                    course={course} 
                    type="elective" 
                  />
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}

function CourseRecommendationCard({ course, type }) {
  const typeConfig = {
    required: {
      className: 'course-card required-card',
      icon: '🎯',
      priority: '우선순위 높음'
    },
    ready: {
      className: 'course-card ready-card',
      icon: '✅',
      priority: '수강 가능'
    },
    elective: {
      className: 'course-card elective-card',
      icon: '📖',
      priority: '추천'
    }
  };

  const config = typeConfig[type] || typeConfig.elective;

  return (
    <div className={config.className}>
      <div className="card-header">
        <span className="course-icon">{config.icon}</span>
        <span className="course-priority">{config.priority}</span>
      </div>
      
      <div className="card-content">
        <h5 className="course-name">{course.name}</h5>
        <div className="course-info">
          <span className="course-code">{course.code}</span>
          <span className="course-credits">{course.credits}학점</span>
        </div>
        <p className="course-description">{course.description}</p>
        {course.reason && (
          <div className="recommendation-reason">
            <small>💡 {course.reason}</small>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendedCourses;
