import { useEffect } from 'react';
import { ToolType } from '@/types/drawing';

export type KeyboardShortcutOptions = {
  deleteSelectedShape: () => void;
  undo: () => void;
  redo: () => void;
  setActiveTool: (tool: ToolType) => void;
  setSelectedShapeId: (id: string | null) => void;
  hasSelectedShape: boolean;
};

export function useKeyboardShortcuts(options: KeyboardShortcutOptions) {
  const {
    deleteSelectedShape,
    undo,
    redo,
    setActiveTool,
    setSelectedShapeId,
    hasSelectedShape,
  } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (hasSelectedShape) {
          e.preventDefault();
          deleteSelectedShape();
        }
      }

      // Escape key (clear selection or revert to select tool)
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedShapeId(null);
        setActiveTool('select');
      }

      // Tool shortcuts (S = select, L = line, R = rectangle, C = circle)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          setActiveTool('select');
        } else if (key === 'l') {
          setActiveTool('line');
        } else if (key === 'r') {
          setActiveTool('rectangle');
        } else if (key === 'c') {
          setActiveTool('circle');
        }
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Cmd+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    deleteSelectedShape,
    undo,
    redo,
    setActiveTool,
    setSelectedShapeId,
    hasSelectedShape,
  ]);
}
