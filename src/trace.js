function dfs(adjacent, current, end, visited = [current]) {
  const nodes = adjacent.get(current) || [];

  return nodes.reduce((list, node) => {
    const nextVisited = [...visited, node];
    if (visited.includes(node)) return list;
    if (node === end) return [...list, nextVisited];
    return [...list, ...dfs(adjacent, node, end, nextVisited)];
  }, []);
}

export default function trace(edges, start, end) {
  const adjacent = edges.reduce((map, [pub, sub]) => {
    if (map.has(pub)) map.get(pub).push(sub);
    else map.set(pub, [sub]);
    return map;
  }, new Map());

  const paths = dfs(adjacent, start, end);
  const services = paths.reduce((set, list) => {
    list.forEach(node => set.add(node));
    return set;
  }, new Set());

  return {
    services,
    paths,
  };
}
