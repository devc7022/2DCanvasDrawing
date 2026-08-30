# 2D Drawing Tool — CAD Vector Canvas Editor

A high-performance, polished, web-based 2D vector drawing application built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and the native **HTML5 Canvas 2D API**.

---

## 🚀 Overview

The **2D Drawing Tool** allows users to interactively draw, select, displace, and delete geometric primitives (Lines, Rectangles, and Circles) on an interactive canvas surface. It provides real-time CAD-style dynamic dimension overlays while drawing, hit-testing for element selection, smooth drag movement, undo/redo history, grid snapping, and single-click JSON/PNG export & import.

This application is implemented **100% frontend-only** using pure native canvas rendering without third-party drawing libraries (no Fabric.js, Konva, or Paper.js).

---

## ✨ Features

- **Line Drawing Tool**:
  - Interactive click-and-drag line rendering.
  - Continuous live Euclidean length (`px`) and angle (`°`) overlay badge.
- **Rectangle Drawing Tool**:
  - Drag in **any direction** (Top-Left ➔ Bottom-Right, Bottom-Right ➔ Top-Left, Top-Right ➔ Bottom-Left, Bottom-Left ➔ Top-Right).
  - Internal coordinate normalization guaranteeing non-negative width & height.
  - Continuous live width (`W`) and height (`H`) overlay badge.
- **Circle Drawing Tool**:
  - Center-to-cursor radius calculation using Euclidean distance.
  - Continuous live Radius (`R`) and Diameter (`D`) overlay badge.
- **Select & Move Tool**:
  - Accurate point-to-segment perpendicular distance hit testing for Lines.
  - Radial distance hit testing for Circles.
  - Bounding box hit testing for Rectangles.
  - Topmost Z-index selection precedence for overlapping shapes.
  - Highlighted selection bounding box with corner handle dots.
  - Smooth displacement dragging without position jump.
- **Deletion**:
  - Delete selected shape via keyboard (`Delete` or `Backspace` keys) or toolbar button.
- **JSON Export & Import**:
  - Export drawings as clean, self-consistent `.json` files (`drawing-YYYY-MM-DD-HH-mm-ss.json`).
  - Import previously saved JSON drawings with instant schema validation and error reporting.
- **PNG Image Export**:
  - Download high-resolution PNG image directly from the canvas surface.
- **Undo / Redo & Keyboard Shortcuts**:
  - Full state history stack (`Ctrl+Z`, `Ctrl+Y`, `Cmd+Z`, `Cmd+Y`).
  - Quick tool selection shortcuts (`S` for Select, `L` for Line, `R` for Rectangle, `C` for Circle, `Esc` to deselect).
- **Responsive High-DPI Canvas**:
  - Pixel-perfect rendering across standard and Retina / High-DPI screens (`window.devicePixelRatio`).
  - `ResizeObserver` container tracking preventing coordinate offset drift on window resize.
- **CAD Grid & Snapping**:
  - Subtle toggleable background grid with optional snap-to-grid alignment.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI & Logic**: [React 18](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Rendering Engine**: Native **HTML5 Canvas 2D API** (`CanvasRenderingContext2D`)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🏗️ Architecture & Component Design

The application follows a clean separation of concerns, isolating mathematical logic, hit testing, state management, pointer event capture, and canvas rendering.

```
2DCanvasDrawing/
├── app/
│   ├── layout.tsx             # Root layout with dark CAD theme
│   ├── page.tsx               # Next.js entry point rendering DrawingEditor
│   └── globals.css            # Tailwind directives and CSS variables
├── components/
│   ├── DrawingEditor.tsx      # Main application container coordinating hooks and components
│   ├── DrawingCanvas.tsx       # Native <canvas> component managing pointer capture
│   ├── Header.tsx             # Top navigation bar (title, export/import buttons)
│   ├── Toolbar.tsx            # Tool selection (Select, Line, Rect, Circle, Delete, Undo/Redo, Snap)
│   ├── ToolButton.tsx         # Accessible CAD button component with keyboard tooltips
│   └── StatusBar.tsx          # Real-time status readout (tool, shape count, selected info, cursor coords)
├── hooks/
│   ├── useDrawing.ts          # Primary state machine (shapes, selection, sessions, undo/redo history)
│   ├── useCanvasResize.ts     # DPR scaling and ResizeObserver hook
│   └── useKeyboardShortcuts.ts # Global hotkey event listener
├── lib/
│   ├── geometry.ts            # Pure geometry math (distance, angle, normalization, bounds, snapping)
│   ├── hitTesting.ts          # Hit-testing algorithms (point-to-line segment, rect, circle, topmost)
│   ├── canvasRenderer.ts      # Canvas rendering pipeline (grid, shapes, selection, preview, dimension badges)
│   └── exportDrawing.ts       # JSON export/import schema validation and PNG downloader
├── types/
│   └── drawing.ts             # Discriminated union types for shapes, tools, and export schemas
├── __tests__/
│   ├── geometry.test.ts       # Vitest tests for geometry utilities
│   ├── hitTesting.test.ts     # Vitest tests for hit testing algorithms
│   └── exportDrawing.test.ts  # Vitest tests for JSON export & import validation
├── vitest.config.ts           # Vitest configuration with alias resolution
├── tailwind.config.ts         # Tailwind configuration with CAD color palette
└── README.md
```

---

## 📐 Geometry & Hit Testing Approach

### 1. Line Length & Angle
- **Length**: $\text{Length} = \sqrt{(x_2 - x1)^2 + (y_2 - y_1)^2}$
- **Angle**: $\text{Angle} = \text{atan2}(y_2 - y_1, x_2 - x_1) \times \frac{180}{\pi}$

### 2. Rectangle Normalization
When drawing a rectangle, coordinates are normalized to guarantee positive width and height regardless of drag direction:
```ts
x = Math.min(startX, currentX);
y = Math.min(startY, currentY);
width = Math.abs(currentX - startX);
height = Math.abs(currentY - startY);
```

### 3. Circle Radius
- **Radius**: $R = \sqrt{(\text{mouseX} - cx)^2 + (\text{mouseY} - cy)^2}$

### 4. Point-to-Line Segment Hit Testing
To determine if a click at $P(px, py)$ hits line segment $AB$ bounded by $A(x_1, y_1)$ and $B(x_2, y_2)$:
1. Project vector $\vec{w} = P - A$ onto segment vector $\vec{v} = B - A$.
2. Calculate normalized projection factor $t = \frac{\vec{w} \cdot \vec{v}}{\|\vec{v}\|^2}$.
3. Clamp $t$ to $[0, 1]$ to restrict distance check strictly to the line segment.
4. Calculate Euclidean distance from $P$ to segment point $C = A + t\vec{v}$.
5. Return `distance <= tolerance` (default 8px).

---

## 📄 JSON Export Schema

Exported JSON files use a clean, consistent schema:

```json
{
  "version": "1.0",
  "createdAt": "2026-08-29T22:00:00.000Z",
  "shapes": [
    {
      "type": "line",
      "x1": 40,
      "y1": 60,
      "x2": 220,
      "y2": 140
    },
    {
      "type": "rectangle",
      "x": 80,
      "y": 200,
      "width": 150,
      "height": 90
    },
    {
      "type": "circle",
      "cx": 400,
      "cy": 150,
      "r": 60
    }
  ]
}
```

---

## 💻 Local Setup & Running Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Development Server
```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev
```

### Run Tests
```bash
# Run Vitest test suite
npx vitest run
```

### Build & Lint
```bash
# Run ESLint
npm run lint

# Production build
npm run build
```

---

## 🧪 Testing Summary

The codebase includes 29 unit tests covering:
- ✅ **Line Length**: Horizontal, vertical, diagonal, and angle math.
- ✅ **Rectangle Normalization**: All 4 drag direction quadrants (TL➔BR, BR➔TL, TR➔BL, BL➔TR).
- ✅ **Circle Radius**: Distance calculations.
- ✅ **Hit Testing**: Line segment proximity, rectangle containment, circle radial bounds, and topmost shape selection precedence.
- ✅ **Shape Movement**: Delta displacement translations for all shape types.
- ✅ **JSON Export & Validation**: Schema formatting, parsing, and error handling.

---

## 📝 License & Author
Built as a Full-Stack Frontend Assignment for 2D Canvas Engineering.
