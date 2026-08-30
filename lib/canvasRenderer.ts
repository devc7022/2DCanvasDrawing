import {
  calculateCircleRadius,
  calculateLineAngle,
  calculateLineLength,
  getShapeBounds,
  normalizeRectangle,
} from '@/lib/geometry';
import {
  CircleShape,
  DrawingSession,
  LineShape,
  Point,
  RectangleShape,
  Shape,
} from '@/types/drawing';

export type RenderOptions = {
  shapes: Shape[];
  selectedShapeId: string | null;
  drawingSession: DrawingSession | null;
  gridSize?: number;
  showGrid?: boolean;
  showDimensionsOnShapes?: boolean;
  theme?: 'dark' | 'light';
};

/**
 * Main rendering pipeline for the 2D Drawing Canvas using native HTML5 Canvas 2D API.
 */
export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: RenderOptions
) {
  const {
    shapes,
    selectedShapeId,
    drawingSession,
    gridSize = 20,
    showGrid = true,
  } = options;

  // 1. Clear background
  ctx.save();
  ctx.fillStyle = '#0f172a'; // CAD Dark Slate
  ctx.fillRect(0, 0, width, height);

  // 2. Draw subtle CAD Grid if enabled
  if (showGrid && gridSize > 0) {
    drawGrid(ctx, width, height, gridSize);
  }

  // 3. Render all finalized shapes
  shapes.forEach((shape) => {
    const isSelected = shape.id === selectedShapeId;
    drawShape(ctx, shape, isSelected);
  });

  // 4. Render selected shape bounding box and handles
  if (selectedShapeId) {
    const selectedShape = shapes.find((s) => s.id === selectedShapeId);
    if (selectedShape) {
      drawSelectionHighlight(ctx, selectedShape);
    }
  }

  // 5. Render active drawing session preview & live dimensions
  if (drawingSession) {
    drawActiveSession(ctx, drawingSession);
  }

  ctx.restore();
}

/**
 * Draws CAD grid lines.
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number
) {
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = 0; x <= width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a finalized shape.
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  isSelected: boolean = false
) {
  ctx.save();

  // Set line dash default (solid)
  ctx.setLineDash([]);
  ctx.lineWidth = isSelected ? 3 : 2;

  switch (shape.type) {
    case 'line': {
      ctx.strokeStyle = isSelected ? '#f59e0b' : '#38bdf8'; // Yellow accent if selected, Cyan default
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();

      // Endpoints
      drawDot(ctx, shape.x1, shape.y1, 3, ctx.strokeStyle);
      drawDot(ctx, shape.x2, shape.y2, 3, ctx.strokeStyle);
      break;
    }

    case 'rectangle': {
      ctx.strokeStyle = isSelected ? '#f59e0b' : '#34d399'; // Emerald default
      ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.1)' : 'rgba(52, 211, 153, 0.08)';
      ctx.beginPath();
      ctx.rect(shape.x, shape.y, shape.width, shape.height);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'circle': {
      ctx.strokeStyle = isSelected ? '#f59e0b' : '#a78bfa'; // Purple default
      ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.1)' : 'rgba(167, 139, 250, 0.08)';
      ctx.beginPath();
      ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Center mark
      drawDot(ctx, shape.cx, shape.cy, 3, ctx.strokeStyle);
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws selection bounding box and corner handles around a selected shape.
 */
function drawSelectionHighlight(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.save();

  const bounds = getShapeBounds(shape);
  const pad = 6;
  const x = bounds.minX - pad;
  const y = bounds.minY - pad;
  const w = bounds.width + pad * 2;
  const h = bounds.height + pad * 2;

  // Dashed bounding rectangle
  ctx.strokeStyle = '#f59e0b'; // Amber / Gold
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(x, y, w, h);

  // Corner handle dots
  const handles: Point[] = [
    { x, y },
    { x: x + w, y },
    { x, y: y + h },
    { x: x + w, y: y + h },
    { x: x + w / 2, y },
    { x: x + w / 2, y: y + h },
    { x, y: y + h / 2 },
    { x: x + w, y: y + h / 2 },
  ];

  ctx.setLineDash([]);
  handles.forEach((hPoint) => {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hPoint.x, hPoint.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Renders the active preview shape and live dimension overlay.
 */
function drawActiveSession(ctx: CanvasRenderingContext2D, session: DrawingSession) {
  const { activeTool, startX, startY, currentX, currentY } = session;

  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;

  let dimLabelText = '';
  let dimSubText = '';
  let labelX = currentX + 15;
  let labelY = currentY - 15;

  switch (activeTool) {
    case 'line': {
      ctx.strokeStyle = '#60a5fa'; // Blue
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      const length = calculateLineLength({ x1: startX, y1: startY, x2: currentX, y2: currentY });
      const angle = calculateLineAngle({ x1: startX, y1: startY, x2: currentX, y2: currentY });

      dimLabelText = `Length: ${length.toFixed(2)} px`;
      dimSubText = `Angle: ${angle.toFixed(1)}°`;
      labelX = (startX + currentX) / 2 + 10;
      labelY = (startY + currentY) / 2 - 10;
      break;
    }

    case 'rectangle': {
      ctx.strokeStyle = '#34d399'; // Emerald
      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';

      const rect = normalizeRectangle(startX, startY, currentX, currentY);
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.fill();
      ctx.stroke();

      dimLabelText = `W: ${rect.width.toFixed(2)} px × H: ${rect.height.toFixed(2)} px`;
      labelX = rect.x + rect.width / 2;
      labelY = rect.y - 12;
      break;
    }

    case 'circle': {
      ctx.strokeStyle = '#a78bfa'; // Purple
      ctx.fillStyle = 'rgba(167, 139, 250, 0.15)';

      const radius = calculateCircleRadius(startX, startY, currentX, currentY);
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Radius vector line
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      dimLabelText = `Radius: ${radius.toFixed(2)} px`;
      dimSubText = `Diameter: ${(radius * 2).toFixed(2)} px`;
      labelX = currentX + 15;
      labelY = currentY + 15;
      break;
    }
  }

  // Draw dimension pill badge overlay
  if (dimLabelText) {
    drawDimensionBadge(ctx, labelX, labelY, dimLabelText, dimSubText);
  }

  ctx.restore();
}

/**
 * Draws a clean CAD dimension pill badge overlay on the canvas.
 */
function drawDimensionBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  subText?: string
) {
  ctx.save();
  ctx.setLineDash([]);
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';

  const textMetrics = ctx.measureText(text);
  const subMetrics = subText ? ctx.measureText(subText) : { width: 0 };
  const contentWidth = Math.max(textMetrics.width, subMetrics.width);

  const padX = 10;
  const padY = 6;
  const lineHeight = 14;
  const badgeWidth = contentWidth + padX * 2;
  const badgeHeight = subText ? lineHeight * 2 + padY * 1.5 : lineHeight + padY * 1.5;

  // Clamp within bounds
  const clampedX = Math.max(10, x);
  const clampedY = Math.max(25, y);

  // Background pill box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.roundRect(clampedX, clampedY, badgeWidth, badgeHeight, 6);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#f8fafc';
  ctx.textBaseline = 'top';
  ctx.fillText(text, clampedX + padX, clampedY + padY);

  if (subText) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 11px system-ui, -apple-system, sans-serif';
    ctx.fillText(subText, clampedX + padX, clampedY + padY + lineHeight + 2);
  }

  ctx.restore();
}

/**
 * Helper to draw a tiny solid dot.
 */
function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
