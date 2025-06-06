// data.js: 캠퍼스 노드 및 간선 정보(간단 예시)
const campusNodes = [
  { id: 'A', name: '정문' },
  { id: 'B', name: '도서관' },
  { id: 'C', name: '공학관' },
  { id: 'D', name: '학생회관' },
  { id: 'E', name: '기숙사' }
];

// 인접 리스트(양방향, 거리 단위: m)
const campusEdges = {
  'A': [{ to: 'B', dist: 200 }, { to: 'D', dist: 300 }],
  'B': [{ to: 'A', dist: 200 }, { to: 'C', dist: 150 }],
  'C': [{ to: 'B', dist: 150 }, { to: 'D', dist: 100 }, { to: 'E', dist: 400 }],
  'D': [{ to: 'A', dist: 300 }, { to: 'C', dist: 100 }, { to: 'E', dist: 250 }],
  'E': [{ to: 'C', dist: 400 }, { to: 'D', dist: 250 }]
};
