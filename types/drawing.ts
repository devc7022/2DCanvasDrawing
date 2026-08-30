export type ToolType = 'select' | 'line' | 'rectangle' | 'circle';

export type BaseShape = {
  id: string;
  color?: string;
  strokeWidth?: number;
};

export type LineShape = BaseShape & {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type RectangleShape = BaseShape & {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleShape = BaseShape & {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
};

export type Shape = LineShape | RectangleShape | CircleShape;

export type Point = {
  x: number;
  y: number;
};

export type BoundingBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export type DrawingSession = {
  activeTool: 'line' | 'rectangle' | 'circle';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

export type DragSession = {
  shapeId: string;
  initialShape: Shape;
  dragStartX: number;
  dragStartY: number;
};

export type DimensionsInfo = {
  text: string;
  subText?: string;
  x: number;
  y: number;
};

export type DrawingExport = {
  version?: string;
  createdAt?: string;
  shapes: Array<{
    type: 'line' | 'rectangle' | 'circle';
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    cx?: number;
    cy?: number;
    r?: number;
    [key: string]: unknown;
  }>;
};
