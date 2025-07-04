import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [courses, setCourses] = useState([]); // 초기값은 빈 배열

  // 백엔드 API에서 데이터를 가져오는 함수
  const fetchCourses = async () => {
    try {
      // 백엔드 서버 주소로 요청
      const response = await fetch('http://localhost:5001/api/courses');
      const data = await response.json();
      setCourses(data); // 받아온 데이터로 state 업데이트
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      // 에러 발생 시 사용자에게 알림을 줄 수 있습니다.
    }
  };

  // 컴포넌트가 처음 렌더링될 때 한 번만 데이터를 가져옵니다.
  useEffect(() => {
    fetchCourses();
  }, []);


  return (
    <div className="container">
      <header>
        <h1>Campus Compass</h1>
        <p className="description">최적의 수강 계획을 위한 강의 추천 시스템</p>
      </header>

      <main>
        {/* TODO: 여기에 필터 컴포넌트가 들어갈 예정입니다. */}
        <div className="course-list">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.name}</h3>
              <p>
                {course.professor} 교수님 | {course.category}
              </p>
              {/* TODO: 카드 클릭 시 상세 정보(선수과목, 자격증 등) 모달을 띄웁니다. */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
