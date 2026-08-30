import { useCallback, useEffect, useRef, useState } from 'react';
import { Point } from '@/types/drawing';

export type CanvasSize = {
  width: number;
  height: number;
  dpr: number;
};

export function useCanvasResize(
  containerRef: React.RefObject<HTMLDivElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const [size, setSize] = useState<CanvasSize>({ width: 800, height: 600, dpr: 1 });
  const sizeRef = useRef<CanvasSize>(size);
  sizeRef.current = size;

  const updateCanvasDimensions = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = Math.floor(container.clientWidth);
    const height = Math.floor(container.clientHeight);
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    // Set internal resolution (high DPI)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set CSS size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    const newSize = { width, height, dpr };
    setSize(newSize);
  }, [containerRef, canvasRef]);

  useEffect(() => {
    updateCanvasDimensions();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });

    resizeObserver.observe(container);
    window.addEventListener('resize', updateCanvasDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [containerRef, updateCanvasDimensions]);

  /**
   * Translates client pointer event coordinates (clientX, clientY) accurately
   * to canvas logical workspace coordinates accounting for bounding rect and CSS scale.
   */
  const getCanvasCoordinates = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement> | PointerEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: e.clientX, y: e.clientY };

      const rect = canvas.getBoundingClientRect();
      const currentSize = sizeRef.current;

      // Scale ratio between actual CSS display size and logical canvas size
      const scaleX = currentSize.width / (rect.width || 1);
      const scaleY = currentSize.height / (rect.height || 1);

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  return {
    width: size.width,
    height: size.height,
    dpr: size.dpr,
    getCanvasCoordinates,
  };
}
