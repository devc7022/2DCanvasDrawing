'use client';

import React, { useCallback, useRef, useState } from 'react';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { Header } from '@/components/Header';
import { StatusBar } from '@/components/StatusBar';
import { Toolbar } from '@/components/Toolbar';
import { useDrawing } from '@/hooks/useDrawing';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  exportCanvasToPNG,
  exportDrawingToJSON,
  parseAndValidateImportedJSON,
} from '@/lib/exportDrawing';
import { Point, Shape } from '@/types/drawing';

// Default initial demo shapes to show capability immediately upon loading
const INITIAL_DEMO_SHAPES: Shape[] = [
  {
    id: 'demo-line-1',
    type: 'line',
    x1: 120,
    y1: 140,
    x2: 380,
    y2: 240,
  },
  {
    id: 'demo-rect-1',
    type: 'rectangle',
    x: 450,
    y: 120,
    width: 220,
    height: 140,
  },
  {
    id: 'demo-circle-1',
    type: 'circle',
    cx: 260,
    cy: 380,
    r: 75,
  },
];

export const DrawingEditor: React.FC = () => {
  const {
    shapes,
    selectedShapeId,
    selectedShape,
    activeTool,
    drawingSession,
    gridSize,
    snapToGridEnabled,
    canUndo,
    canRedo,
    setActiveTool,
    setSelectedShapeId,
    deleteSelectedShape,
    clearAllShapes,
    setShapes,
    toggleSnapToGrid,
    undo,
    redo,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useDrawing(INITIAL_DEMO_SHAPES);

  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Bind keyboard shortcuts (Delete, Backspace, Ctrl+Z, Ctrl+Y, S, L, R, C, Escape)
  useKeyboardShortcuts({
    deleteSelectedShape,
    undo,
    redo,
    setActiveTool,
    setSelectedShapeId,
    hasSelectedShape: !!selectedShapeId,
  });

  const handleExportJSON = useCallback(() => {
    exportDrawingToJSON(shapes);
  }, [shapes]);

  const handleImportJSON = useCallback(
    (jsonString: string) => {
      const importedShapes = parseAndValidateImportedJSON(jsonString);
      setShapes(importedShapes);
    },
    [setShapes]
  );

  const handleExportPNG = useCallback(() => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      exportCanvasToPNG(canvas);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* Top Header */}
      <Header
        shapes={shapes}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportPNG={handleExportPNG}
      />

      {/* Main Tool Bar */}
      <Toolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        hasSelection={!!selectedShapeId}
        onDeleteSelected={deleteSelectedShape}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        snapToGridEnabled={snapToGridEnabled}
        onToggleSnapToGrid={toggleSnapToGrid}
        onClearAll={clearAllShapes}
      />

      {/* Drawing Canvas Area */}
      <main className="flex-1 relative w-full h-full min-h-0 overflow-hidden">
        <DrawingCanvas
          shapes={shapes}
          selectedShapeId={selectedShapeId}
          activeTool={activeTool}
          drawingSession={drawingSession}
          gridSize={gridSize}
          showGrid={true}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onCursorMove={setCursorPos}
        />
      </main>

      {/* Bottom Status Bar */}
      <StatusBar
        activeTool={activeTool}
        shapeCount={shapes.length}
        selectedShape={selectedShape}
        cursorPos={cursorPos}
        gridSize={gridSize}
        snapEnabled={snapToGridEnabled}
      />
    </div>
  );
};
