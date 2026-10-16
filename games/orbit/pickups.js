export function inPickupRange(start, end, point, radius) {
  const x = end.x - start.x,
    y = end.y - start.y,
    z = end.z - start.z,
    length = x * x + y * y + z * z;
  const t = length
    ? Math.max(
        0,
        Math.min(
          1,
          ((point.x - start.x) * x +
            (point.y - start.y) * y +
            (point.z - start.z) * z) /
            length,
        ),
      )
    : 0;
  return (
    (point.x - start.x - x * t) ** 2 +
      (point.y - start.y - y * t) ** 2 +
      (point.z - start.z - z * t) ** 2 <=
    radius * radius
  );
}
