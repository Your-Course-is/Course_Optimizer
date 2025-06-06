// algorithm.js: 단순 Dijkstra 최단 경로 알고리즘
function findShortestPath(start, end) {
  const distances = {};
  const prev = {};
  const visited = {};
  const queue = [];

  campusNodes.forEach(node => {
    distances[node.id] = Infinity;
    prev[node.id] = null;
  });
  distances[start] = 0;
  queue.push({ id: start, dist: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { id: current } = queue.shift();
    if (visited[current]) continue;
    visited[current] = true;

    if (current === end) break;

    (campusEdges[current] || []).forEach(neighbor => {
      const alt = distances[current] + neighbor.dist;
      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        prev[neighbor.to] = current;
        queue.push({ id: neighbor.to, dist: alt });
      }
    });
  }

  // 경로 추적
  const path = [];
  let u = end;
  while (u) {
    path.unshift(u);
    u = prev[u];
  }
  return { path, distance: distances[end] };
}
