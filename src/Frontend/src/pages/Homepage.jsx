import { useState, useEffect } from 'react';
import '../App.css'; // 경로 수정: './App.css' -> '../App.css'

// 컴포넌트 이름 수정: App -> HomePage
export default function HomePage() { 
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 불필요한 container, header 제거하고 main만 남김
  return (
    <main>
      <div className="course-list">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h3>{course.name}</h3>
            <p>
              {course.professor} 교수님 | {course.category}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
