import React from 'react';
import {
  Circle,
  Grid,
  MousePointer,
  Redo2,
  RotateCcw,
  Slash,
  Square,
  Trash2,
  Undo2,
} from 'lucide-react';
import { ToolButton } from '@/components/ToolButton';
import { ToolType } from '@/types/drawing';

export type ToolbarProps = {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  hasSelection: boolean;
  onDeleteSelected: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  snapToGridEnabled: boolean;
  onToggleSnapToGrid: () => void;
  onClearAll: () => void;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  hasSelection,
  onDeleteSelected,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  snapToGridEnabled,
  onToggleSnapToGrid,
  onClearAll,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
      {/* Primary Drawing Tools */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mr-1 hidden sm:inline">
          Tools
        </span>

        <ToolButton
          label="Select"
          shortcut="S"
          icon={<MousePointer size={16} />}
          active={activeTool === 'select'}
          onClick={() => onSelectTool('select')}
        />

        <ToolButton
          label="Line"
          shortcut="L"
          icon={<Slash size={16} />}
          active={activeTool === 'line'}
          onClick={() => onSelectTool('line')}
        />

        <ToolButton
          label="Rectangle"
          shortcut="R"
          icon={<Square size={16} />}
          active={activeTool === 'rectangle'}
          onClick={() => onSelectTool('rectangle')}
        />

        <ToolButton
          label="Circle"
          shortcut="C"
          icon={<Circle size={16} />}
          active={activeTool === 'circle'}
          onClick={() => onSelectTool('circle')}
        />
      </div>

      {/* Editing & History Controls */}
      <div className="flex items-center gap-1.5">
        <ToolButton
          label="Delete"
          shortcut="Del"
          icon={<Trash2 size={16} />}
          disabled={!hasSelection}
          variant="danger"
          onClick={onDeleteSelected}
        />

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        <ToolButton
          label="Undo"
          shortcut="Ctrl+Z"
          icon={<Undo2 size={16} />}
          disabled={!canUndo}
          onClick={onUndo}
        />

        <ToolButton
          label="Redo"
          shortcut="Ctrl+Y"
          icon={<Redo2 size={16} />}
          disabled={!canRedo}
          onClick={onRedo}
        />

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        <ToolButton
          label={snapToGridEnabled ? 'Snap On' : 'Snap Off'}
          icon={<Grid size={16} />}
          active={snapToGridEnabled}
          variant={snapToGridEnabled ? 'accent' : 'default'}
          onClick={onToggleSnapToGrid}
        />

        <ToolButton
          label="Clear"
          icon={<RotateCcw size={16} />}
          onClick={onClearAll}
        />
      </div>
    </div>
  );
};
