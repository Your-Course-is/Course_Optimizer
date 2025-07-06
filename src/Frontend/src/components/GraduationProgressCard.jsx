import React from 'react';

export default function GraduationProgressCard({ takenCourses = [] }) {
  // 졸업요건 (실제 기준에 맞게 숫자 수정)
  const requirements = {
    '전공기초': 15,
    '전공필수': 30,
    '전공선택': 30,
    '교양필수': 15,
    '교양선택': 15,
  };

  // 카테고리별 이수 학점 계산
  const creditsByCategory = {};
  takenCourses.forEach(course => {
    if (!creditsByCategory[course.category]) creditsByCategory[course.category] = 0;
    creditsByCategory[course.category] += course.credit || 0;
  });

  return (
    <div className="graduation-progress-card dashboard-card">
      <h3>졸업 진행도 요약</h3>
      {Object.entries(requirements).map(([category, required]) => {
        const taken = creditsByCategory[category] || 0;
        const percent = Math.min(100, Math.round((taken / required) * 100));
        return (
          <div className="progress-item" key={category}>
            <span>{category}</span>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${percent}%` }}></div>
            </div>
            <span>({taken}/{required})</span>
          </div>
        );
      })}
      <p style={{ marginTop: '1rem', fontSize: '0.9em', color: '#aaa' }}>
        자세한 정보는 마이페이지에서 확인하세요.
      </p>
    </div>
  );
}