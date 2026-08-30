import { CircleShape, DrawingExport, LineShape, RectangleShape, Shape } from '@/types/drawing';

/**
 * Formats a Date object into YYYY-MM-DD-HH-mm-ss format for filenames.
 */
export function getExportFilename(extension: 'json' | 'png'): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `drawing-${timestamp}.${extension}`;
}

/**
 * Prepares the shape objects for clean JSON export by stripping internal runtime IDs.
 */
export function formatShapesForExport(shapes: Shape[]): DrawingExport {
  const cleanShapes = shapes.map((shape) => {
    switch (shape.type) {
      case 'line':
        return {
          type: 'line' as const,
          x1: shape.x1,
          y1: shape.y1,
          x2: shape.x2,
          y2: shape.y2,
        };
      case 'rectangle':
        return {
          type: 'rectangle' as const,
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
        };
      case 'circle':
        return {
          type: 'circle' as const,
          cx: shape.cx,
          cy: shape.cy,
          r: shape.r,
        };
    }
  });

  return {
    version: '1.0',
    createdAt: new Date().toISOString(),
    shapes: cleanShapes,
  };
}

/**
 * Triggers a browser file download for a JSON string.
 */
export function exportDrawingToJSON(shapes: Shape[], filename?: string) {
  const exportData = formatShapesForExport(shapes);
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename || getExportFilename('json');
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses an imported JSON drawing file.
 * Returns array of validated Shape objects with fresh unique IDs.
 */
export function parseAndValidateImportedJSON(jsonContent: string): Shape[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    throw new Error('Invalid JSON file format.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Imported data must be a JSON object.');
  }

  const rawShapes = (parsed as { shapes?: unknown }).shapes;
  if (!Array.isArray(rawShapes)) {
    throw new Error('Imported JSON must contain a "shapes" array.');
  }

  const validatedShapes: Shape[] = [];

  for (let i = 0; i < rawShapes.length; i++) {
    const s = rawShapes[i];
    if (!s || typeof s !== 'object') continue;

    const type = (s as { type?: string }).type;
    const id = generateId();

    if (type === 'line') {
      const { x1, y1, x2, y2 } = s as Record<string, unknown>;
      if (
        typeof x1 === 'number' &&
        typeof y1 === 'number' &&
        typeof x2 === 'number' &&
        typeof y2 === 'number'
      ) {
        validatedShapes.push({ id, type: 'line', x1, y1, x2, y2 } as LineShape);
      }
    } else if (type === 'rectangle') {
      const { x, y, width, height } = s as Record<string, unknown>;
      if (
        typeof x === 'number' &&
        typeof y === 'number' &&
        typeof width === 'number' &&
        typeof height === 'number' &&
        width >= 0 &&
        height >= 0
      ) {
        validatedShapes.push({
          id,
          type: 'rectangle',
          x,
          y,
          width,
          height,
        } as RectangleShape);
      }
    } else if (type === 'circle') {
      const { cx, cy, r } = s as Record<string, unknown>;
      if (
        typeof cx === 'number' &&
        typeof cy === 'number' &&
        typeof r === 'number' &&
        r >= 0
      ) {
        validatedShapes.push({ id, type: 'circle', cx, cy, r } as CircleShape);
      }
    }
  }

  return validatedShapes;
}

/**
 * Triggers a browser file download of the canvas content as a PNG image.
 */
export function exportCanvasToPNG(canvas: HTMLCanvasElement, filename?: string) {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename || getExportFilename('png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Utility to generate a unique shape ID.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `shape_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
