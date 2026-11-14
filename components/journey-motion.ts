export function vineThrough(x: number, height: number, nodes: readonly number[], reach: number) {
  let previous = 0;
  const segments = [...nodes, height].map((y, index) => {
    const bend = index % 2 === 0 ? reach : -reach;
    const gap = (y - previous) / 3;
    const segment = `C${x + bend} ${previous + gap} ${x + bend} ${y - gap} ${x} ${y}`;
    previous = y;
    return segment;
  });
  return `M${x} 0${segments.join("")}`;
}

// Y increases monotonically along the spine, so binary search the length at a node.
export function nodeProgress(path: Pick<SVGPathElement, "getPointAtLength">, length: number, y: number) {
  let low = 0;
  let high = length;
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    if (path.getPointAtLength(mid).y < y) low = mid;
    else high = mid;
  }
  return (low + high) / (2 * length);
}
