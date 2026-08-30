import { calculateDistance } from '@/lib/geometry';
import { CircleShape, LineShape, Point, RectangleShape, Shape } from '@/types/drawing';

/**
 * Determines whether a point is within tolerance pixels of a line segment.
 * Calculates shortest perpendicular distance to bounded segment AB.
 */
export function isPointNearLine(
  point: Point,
  line: LineShape,
  tolerance: number = 8
): boolean {
  const { x: px, y: py } = point;
  const { x1, y1, x2, y2 } = line;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  // Degenerate line (point)
  if (lenSq === 0) {
    return calculateDistance(px, py, x1, y1) <= tolerance;
  }

  // Projection parameter t = dot((P - A), (B - A)) / |B - A|^2
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  // Clamp t to segment bounds [0, 1]
  t = Math.max(0, Math.min(1, t));

  // Closest point on segment
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  const dist = calculateDistance(px, py, projX, projY);
  return dist <= tolerance;
}

/**
 * Determines whether a point is inside an axis-aligned rectangle.
 */
export function isPointInsideRectangle(
  point: Point,
  rectangle: RectangleShape,
  tolerance: number = 4
): boolean {
  const { x: px, y: py } = point;
  const minX = rectangle.x - tolerance;
  const maxX = rectangle.x + rectangle.width + tolerance;
  const minY = rectangle.y - tolerance;
  const maxY = rectangle.y + rectangle.height + tolerance;

  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}

/**
 * Determines whether a point is inside a circle.
 */
export function isPointInsideCircle(
  point: Point,
  circle: CircleShape,
  tolerance: number = 4
): boolean {
  const dist = calculateDistance(point.x, point.y, circle.cx, circle.cy);
  return dist <= circle.r + tolerance;
}

/**
 * Checks whether a point hits a given shape.
 */
export function isPointInsideShape(
  point: Point,
  shape: Shape,
  tolerance: number = 8
): boolean {
  switch (shape.type) {
    case 'line':
      return isPointNearLine(point, shape, tolerance);
    case 'rectangle':
      return isPointInsideRectangle(point, shape, tolerance);
    case 'circle':
      return isPointInsideCircle(point, shape, tolerance);
  }
}

/**
 * Finds the topmost (most recently rendered / highest z-index) shape under point.
 * Iterates shapes from back to front (end of array to beginning).
 */
export function findShapeAtPoint(
  point: Point,
  shapes: Shape[],
  tolerance: number = 8
): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (isPointInsideShape(point, shape, tolerance)) {
      return shape;
    }
  }
  return null;
}
