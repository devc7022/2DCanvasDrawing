import { BoundingBox, CircleShape, LineShape, Point, RectangleShape, Shape } from '@/types/drawing';

/**
 * Calculates Euclidean distance between two points (x1, y1) and (x2, y2).
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.hypot(dx, dy);
}

/**
 * Calculates the Euclidean length of a line segment.
 */
export function calculateLineLength(line: Pick<LineShape, 'x1' | 'y1' | 'x2' | 'y2'>): number {
  return calculateDistance(line.x1, line.y1, line.x2, line.y2);
}

/**
 * Calculates the angle of a line in degrees (-180 to 180).
 */
export function calculateLineAngle(line: Pick<LineShape, 'x1' | 'y1' | 'x2' | 'y2'>): number {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Calculates the radius of a circle from center (cx, cy) to edge (x, y).
 */
export function calculateCircleRadius(cx: number, cy: number, x: number, y: number): number {
  return calculateDistance(cx, cy, x, y);
}

/**
 * Normalizes rectangle coordinates so x, y represent the top-left corner
 * and width/height are always non-negative, supporting dragging in any direction.
 */
export function normalizeRectangle(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number
): { x: number; y: number; width: number; height: number } {
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  return { x, y, width, height };
}

/**
 * Moves a shape by a displacement delta (dx, dy) without mutating the original.
 */
export function moveShape<T extends Shape>(shape: T, dx: number, dy: number): T {
  switch (shape.type) {
    case 'line':
      return {
        ...shape,
        x1: shape.x1 + dx,
        y1: shape.y1 + dy,
        x2: shape.x2 + dx,
        y2: shape.y2 + dy,
      } as T;

    case 'rectangle':
      return {
        ...shape,
        x: shape.x + dx,
        y: shape.y + dy,
      } as T;

    case 'circle':
      return {
        ...shape,
        cx: shape.cx + dx,
        cy: shape.cy + dy,
      } as T;
  }
}

/**
 * Calculates the bounding box for any shape type.
 */
export function getShapeBounds(shape: Shape): BoundingBox {
  switch (shape.type) {
    case 'line': {
      const minX = Math.min(shape.x1, shape.x2);
      const minY = Math.min(shape.y1, shape.y2);
      const maxX = Math.max(shape.x1, shape.x2);
      const maxY = Math.max(shape.y1, shape.y2);
      return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }
    case 'rectangle': {
      const minX = shape.x;
      const minY = shape.y;
      const maxX = shape.x + shape.width;
      const maxY = shape.y + shape.height;
      return { minX, minY, maxX, maxY, width: shape.width, height: shape.height };
    }
    case 'circle': {
      const minX = shape.cx - shape.r;
      const minY = shape.cy - shape.r;
      const maxX = shape.cx + shape.r;
      const maxY = shape.cy + shape.r;
      return { minX, minY, maxX, maxY, width: shape.r * 2, height: shape.r * 2 };
    }
  }
}

/**
 * Snaps a value to the nearest grid step.
 */
export function snapToGrid(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

/**
 * Snaps a 2D point to the nearest grid intersection.
 */
export function snapPointToGrid(point: Point, step: number): Point {
  if (step <= 0) return point;
  return {
    x: snapToGrid(point.x, step),
    y: snapToGrid(point.y, step),
  };
}
