// @flow
import type {
  Edges,
  ExecutionPath,
  ServiceName,
  TraceResult,
} from './types.js.flow';

function dfs(adjacent, current, end, visited = [current]): Array<ExecutionPath> {
  const nodes = adjacent[current] || [];

  return nodes.reduce((list, node) => {
    const nextVisited = [...visited, node];
    if (visited.includes(node)) return list;
    if (node === end) return [...list, nextVisited];
    return [...list, ...dfs(adjacent, node, end, nextVisited)];
  }, []);
}

type Adjacent = {[ServiceName]: Array<ServiceName>};

export default function trace(edges: Edges, start: ServiceName, end: ServiceName): TraceResult {
  const adjacent = edges.reduce((map: Adjacent, [pub, sub]) => {
    /* eslint-disable no-param-reassign */
    if (pub in map) map[pub].push(sub);
    else map[pub] = [sub];
    return map;
  }, {});

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
