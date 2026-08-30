import React from 'react';
import { calculateCircleRadius, calculateLineLength } from '@/lib/geometry';
import { Point, Shape, ToolType } from '@/types/drawing';

export type StatusBarProps = {
  activeTool: ToolType;
  shapeCount: number;
  selectedShape: Shape | null;
  cursorPos: Point | null;
  gridSize: number;
  snapEnabled: boolean;
};

export const StatusBar: React.FC<StatusBarProps> = ({
  activeTool,
  shapeCount,
  selectedShape,
  cursorPos,
  gridSize,
  snapEnabled,
}) => {
  let selectedInfo = 'None';

  if (selectedShape) {
    switch (selectedShape.type) {
      case 'line': {
        const len = calculateLineLength(selectedShape);
        selectedInfo = `Line (Length: ${len.toFixed(2)} px)`;
        break;
      }
      case 'rectangle': {
        selectedInfo = `Rectangle (W: ${selectedShape.width.toFixed(
          2
        )} × H: ${selectedShape.height.toFixed(2)} px)`;
        break;
      }
      case 'circle': {
        const r = selectedShape.r;
        selectedInfo = `Circle (Radius: ${r.toFixed(2)} px)`;
        break;
      }
    }
  }

  const toolDisplayNames: Record<ToolType, string> = {
    select: 'Select',
    line: 'Line',
    rectangle: 'Rectangle',
    circle: 'Circle',
  };

  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 px-4 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-400">
      {/* Tool & Shape counts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Tool:</span>
          <span className="font-semibold text-sky-400">{toolDisplayNames[activeTool]}</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Shapes:</span>
          <span className="font-semibold text-slate-200">{shapeCount}</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Selected:</span>
          <span
            className={`font-semibold ${
              selectedShape ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            {selectedInfo}
          </span>
        </div>
      </div>

      {/* Cursor & Grid info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Grid:</span>
          <span className="text-slate-300">
            {snapEnabled ? `${gridSize}px (Snap On)` : `${gridSize}px`}
          </span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-1.5 min-w-[140px] justify-end">
          <span className="text-slate-500">X, Y:</span>
          <span className="text-slate-200">
            {cursorPos
              ? `${cursorPos.x.toFixed(1)}, ${cursorPos.y.toFixed(1)} px`
              : '—'}
          </span>
        </div>
      </div>
    </footer>
  );
};
