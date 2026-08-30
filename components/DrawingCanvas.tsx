import React, { useEffect, useRef, useState } from 'react';
import { renderCanvas } from '@/lib/canvasRenderer';
import { useCanvasResize } from '@/hooks/useCanvasResize';
import { DrawingSession, Point, Shape, ToolType } from '@/types/drawing';

export type DrawingCanvasProps = {
  shapes: Shape[];
  selectedShapeId: string | null;
  activeTool: ToolType;
  drawingSession: DrawingSession | null;
  gridSize: number;
  showGrid?: boolean;
  onPointerDown: (coords: Point) => void;
  onPointerMove: (coords: Point) => void;
  onPointerUp: (coords: Point) => void;
  onPointerCancel: () => void;
  onCursorMove: (coords: Point | null) => void;
};

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  shapes,
  selectedShapeId,
  activeTool,
  drawingSession,
  gridSize,
  showGrid = true,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onCursorMove,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);

  const { width, height, getCanvasCoordinates } = useCanvasResize(
    containerRef,
    canvasRef
  );

  // Redraw canvas whenever shapes, selection, session, or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      renderCanvas(ctx, width, height, {
        shapes,
        selectedShapeId,
        drawingSession,
        gridSize,
        showGrid,
      });
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [width, height, shapes, selectedShapeId, drawingSession, gridSize, showGrid]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPointerDown(true);
    const coords = getCanvasCoordinates(e);
    onPointerDown(coords);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    onCursorMove(coords);
    onPointerMove(coords);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsPointerDown(false);
    const coords = getCanvasCoordinates(e);
    onPointerUp(coords);
  };

  const handlePointerLeave = () => {
    onCursorMove(null);
  };

  const handlePointerCancel = () => {
    setIsPointerDown(false);
    onPointerCancel();
  };

  // Cursor calculation
  let cursorClass = 'cursor-crosshair';
  if (activeTool === 'select') {
    if (isPointerDown && selectedShapeId) {
      cursorClass = 'cursor-grabbing';
    } else if (selectedShapeId) {
      cursorClass = 'cursor-grab';
    } else {
      cursorClass = 'cursor-default';
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] bg-slate-900 overflow-hidden flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
        className={`touch-none ${cursorClass} block w-full h-full`}
      />
    </div>
  );
};
