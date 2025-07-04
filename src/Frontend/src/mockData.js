export const mockCourses = [
  {
    id: 1,
    name: '자료구조',
    professor: '김유성',
    category: '전공필수',
    grade: 2,
    description: '컴퓨터공학의 핵심적인 데이터 구조를 배웁니다.',
    tips: [
      'C++ 문법을 미리 복습하고 오면 좋습니다.',
      '백준에서 관련 문제들을 풀어보면 학점 따기 수월해요.',
    ],
  },
  {
    id: 2,
    name: '컴퓨터구조',
    professor: '이영희',
    category: '전공필수',
    grade: 2,
    description: '컴퓨터의 하드웨어 구성과 동작 원리를 학습합니다.',
    tips: ['논리회로 과목을 먼저 듣는 것을 강력히 추천합니다 (내용이 이어짐).'],
  },
  {
    id: 3,
    name: '객체지향프로그래밍',
    professor: '박철수',
    category: '전공선택',
    grade: 3,
    description: 'Java를 이용해 객체지향 개념을 실습합니다.',
    tips: [
      '방학 때 "Java의 정석" 책 한번 보고 오세요!',
      '디자인 패턴에 대해 따로 공부하면 프로젝트 때 도움이 됩니다.',
    ],
  },
];