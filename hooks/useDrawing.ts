import { useCallback, useState } from 'react';
import { generateId } from '@/lib/exportDrawing';
import {
  calculateCircleRadius,
  calculateLineLength,
  moveShape,
  normalizeRectangle,
  snapPointToGrid,
} from '@/lib/geometry';
import { findShapeAtPoint } from '@/lib/hitTesting';
import {
  CircleShape,
  DragSession,
  DrawingSession,
  LineShape,
  Point,
  RectangleShape,
  Shape,
  ToolType,
} from '@/types/drawing';

export type UseDrawingReturn = {
  shapes: Shape[];
  selectedShapeId: string | null;
  selectedShape: Shape | null;
  activeTool: ToolType;
  drawingSession: DrawingSession | null;
  dragSession: DragSession | null;
  gridSize: number;
  snapToGridEnabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  setActiveTool: (tool: ToolType) => void;
  setSelectedShapeId: (id: string | null) => void;
  deleteSelectedShape: () => void;
  clearAllShapes: () => void;
  setShapes: (shapes: Shape[]) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  undo: () => void;
  redo: () => void;
  handlePointerDown: (coords: Point) => void;
  handlePointerMove: (coords: Point) => void;
  handlePointerUp: (coords: Point) => void;
  handlePointerCancel: () => void;
};

export function useDrawing(initialShapes: Shape[] = []): UseDrawingReturn {
  const [shapes, setShapesState] = useState<Shape[]>(initialShapes);
  const [selectedShapeId, setSelectedShapeIdState] = useState<string | null>(null);
  const [activeTool, setActiveToolState] = useState<ToolType>('select');
  const [drawingSession, setDrawingSession] = useState<DrawingSession | null>(null);
  const [dragSession, setDragSession] = useState<DragSession | null>(null);

  const [gridSize, setGridSize] = useState<number>(20);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState<boolean>(false);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<Shape[][]>([initialShapes]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const pushToHistory = useCallback(
    (newShapes: Shape[]) => {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newShapes);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    },
    [history, historyIndex]
  );

  const setShapes = useCallback(
    (newShapes: Shape[]) => {
      setShapesState(newShapes);
      setSelectedShapeIdState(null);
      pushToHistory(newShapes);
    },
    [pushToHistory]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevShapes = history[prevIndex];
      setHistoryIndex(prevIndex);
      setShapesState(prevShapes);
      setSelectedShapeIdState(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextShapes = history[nextIndex];
      setHistoryIndex(nextIndex);
      setShapesState(nextShapes);
      setSelectedShapeIdState(null);
    }
  }, [history, historyIndex]);

  const setActiveTool = useCallback((tool: ToolType) => {
    setActiveToolState(tool);
    if (tool !== 'select') {
      setSelectedShapeIdState(null);
    }
  }, []);

  const setSelectedShapeId = useCallback((id: string | null) => {
    setSelectedShapeIdState(id);
  }, []);

  const deleteSelectedShape = useCallback(() => {
    if (!selectedShapeId) return;

    const newShapes = shapes.filter((s) => s.id !== selectedShapeId);
    setShapesState(newShapes);
    setSelectedShapeIdState(null);
    pushToHistory(newShapes);
  }, [selectedShapeId, shapes, pushToHistory]);

  const clearAllShapes = useCallback(() => {
    setShapesState([]);
    setSelectedShapeIdState(null);
    pushToHistory([]);
  }, [pushToHistory]);

  const toggleSnapToGrid = useCallback(() => {
    setSnapToGridEnabled((prev) => !prev);
  }, []);

  const selectedShape = shapes.find((s) => s.id === selectedShapeId) || null;

  // Pointer Event Handlers
  const handlePointerDown = useCallback(
    (rawCoords: Point) => {
      const coords = snapToGridEnabled
        ? snapPointToGrid(rawCoords, gridSize)
        : rawCoords;

      if (activeTool === 'select') {
        // Hit test shapes top to bottom
        const hitShape = findShapeAtPoint(rawCoords, shapes, 8);
        if (hitShape) {
          setSelectedShapeIdState(hitShape.id);
          // Start drag session from initial pointer and initial shape
          setDragSession({
            shapeId: hitShape.id,
            initialShape: JSON.parse(JSON.stringify(hitShape)),
            dragStartX: rawCoords.x,
            dragStartY: rawCoords.y,
          });
        } else {
          setSelectedShapeIdState(null);
          setDragSession(null);
        }
      } else {
        // Drawing tool active (line, rectangle, circle)
        setSelectedShapeIdState(null);
        setDrawingSession({
          activeTool,
          startX: coords.x,
          startY: coords.y,
          currentX: coords.x,
          currentY: coords.y,
        });
      }
    },
    [activeTool, gridSize, snapToGridEnabled, shapes]
  );

  const handlePointerMove = useCallback(
    (rawCoords: Point) => {
      const coords = snapToGridEnabled
        ? snapPointToGrid(rawCoords, gridSize)
        : rawCoords;

      if (dragSession) {
        // Dragging selected shape
        const dx = coords.x - dragSession.dragStartX;
        const dy = coords.y - dragSession.dragStartY;

        const updatedShape = moveShape(dragSession.initialShape, dx, dy);
        setShapesState((prevShapes) =>
          prevShapes.map((s) => (s.id === dragSession.shapeId ? updatedShape : s))
        );
      } else if (drawingSession) {
        // Drawing live preview
        setDrawingSession((prev) =>
          prev
            ? {
                ...prev,
                currentX: coords.x,
                currentY: coords.y,
              }
            : null
        );
      }
    },
    [dragSession, drawingSession, gridSize, snapToGridEnabled]
  );

  const handlePointerUp = useCallback(
    (rawCoords: Point) => {
      const coords = snapToGridEnabled
        ? snapPointToGrid(rawCoords, gridSize)
        : rawCoords;

      if (dragSession) {
        // Finalize drag
        setDragSession(null);
        pushToHistory(shapes);
      } else if (drawingSession) {
        const { activeTool: tool, startX, startY } = drawingSession;
        const currentX = coords.x;
        const currentY = coords.y;

        let newShape: Shape | null = null;
        const id = generateId();

        if (tool === 'line') {
          const len = calculateLineLength({ x1: startX, y1: startY, x2: currentX, y2: currentY });
          if (len >= 2) {
            newShape = { id, type: 'line', x1: startX, y1: startY, x2: currentX, y2: currentY } as LineShape;
          }
        } else if (tool === 'rectangle') {
          const rect = normalizeRectangle(startX, startY, currentX, currentY);
          if (rect.width >= 2 && rect.height >= 2) {
            newShape = { id, type: 'rectangle', ...rect } as RectangleShape;
          }
        } else if (tool === 'circle') {
          const r = calculateCircleRadius(startX, startY, currentX, currentY);
          if (r >= 2) {
            newShape = { id, type: 'circle', cx: startX, cy: startY, r } as CircleShape;
          }
        }

        if (newShape) {
          const newShapes = [...shapes, newShape];
          setShapesState(newShapes);
          setSelectedShapeIdState(newShape.id);
          setActiveToolState('select'); // Automatically return to select mode after drawing
          pushToHistory(newShapes);
        }

        setDrawingSession(null);
      }
    },
    [dragSession, drawingSession, gridSize, snapToGridEnabled, shapes, pushToHistory]
  );

  const handlePointerCancel = useCallback(() => {
    setDrawingSession(null);
    setDragSession(null);
  }, []);

  return {
    shapes,
    selectedShapeId,
    selectedShape,
    activeTool,
    drawingSession,
    dragSession,
    gridSize,
    snapToGridEnabled,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    setActiveTool,
    setSelectedShapeId,
    deleteSelectedShape,
    clearAllShapes,
    setShapes,
    toggleSnapToGrid,
    setGridSize,
    undo,
    redo,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}
