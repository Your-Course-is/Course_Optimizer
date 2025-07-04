import React from 'react';

export default function GraduationProgressCard() {
  // 추후에 실제 데이터를 받아와서 바 차트 등으로 시각화합니다.
  return (
    <div className="dashboard-card">
      <h3>졸업 진행도 요약</h3>
      <div className="progress-item">
        <span>전공 필수</span>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: '60%' }}></div>
        </div>
        <span>(18/30)</span>
      </div>
      <div className="progress-item">
        <span>교양</span>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: '80%' }}></div>
        </div>
        <span>(24/30)</span>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.9em', color: '#aaa' }}>
        자세한 정보는 마이페이지에서 확인하세요.
      </p>
    </div>
  );
}