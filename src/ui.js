// ui.js: UI 초기화 및 이벤트 처리
document.addEventListener('DOMContentLoaded', () => {
  const startSel = document.getElementById('start');
  const endSel = document.getElementById('end');
  const findBtn = document.getElementById('find-path');
  const resultDiv = document.getElementById('path-result');
  const mapDiv = document.getElementById('campus-map');

  // 셀렉트 박스 초기화
  campusNodes.forEach(node => {
    const opt1 = document.createElement('option');
    opt1.value = node.id;
    opt1.textContent = node.name;
    startSel.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = node.id;
    opt2.textContent = node.name;
    endSel.appendChild(opt2);
  });
  endSel.selectedIndex = 1;

  // 경로 탐색 버튼 이벤트
  findBtn.addEventListener('click', () => {
    const start = startSel.value;
    const end = endSel.value;
    if (start === end) {
      resultDiv.textContent = '출발지와 도착지가 같습니다.';
      return;
    }
    const { path, distance } = findShortestPath(start, end);
    if (distance === Infinity) {
      resultDiv.textContent = '경로를 찾을 수 없습니다.';
    } else {
      const pathNames = path.map(id => campusNodes.find(n => n.id === id).name).join(' → ');
      resultDiv.textContent = `경로: ${pathNames} (총 ${distance}m)`;
    }
  });

  // 지도 예시
  mapDiv.textContent = '여기에 캠퍼스 지도가 표시됩니다.';
});
