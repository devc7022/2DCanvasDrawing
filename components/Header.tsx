import React, { useRef } from 'react';
import { Download, FileCode, Image as ImageIcon, Upload } from 'lucide-react';
import { Shape } from '@/types/drawing';

export type HeaderProps = {
  shapes: Shape[];
  onExportJSON: () => void;
  onImportJSON: (jsonString: string) => void;
  onExportPNG: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  shapes,
  onExportJSON,
  onImportJSON,
  onExportPNG,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          onImportJSON(content);
        } catch (err) {
          alert((err as Error).message || 'Failed to import JSON file.');
        }
      }
    };
    reader.readAsText(file);
    // Reset file input so re-selecting same file works
    e.target.value = '';
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
      {/* Brand & CAD Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <FileCode size={20} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
            2D Drawing Tool
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              CAD Vector
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">Precision geometry canvas engine</p>
        </div>
      </div>

      {/* Import / Export Controls */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          id="import-json-input"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 transition"
          title="Import drawing from JSON file"
        >
          <Upload size={14} className="text-slate-400" />
          <span>Import JSON</span>
        </button>

        <button
          type="button"
          onClick={onExportPNG}
          disabled={shapes.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Export drawing as PNG image"
        >
          <ImageIcon size={14} className="text-sky-400" />
          <span className="hidden sm:inline">Export PNG</span>
        </button>

        <button
          type="button"
          onClick={onExportJSON}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-md shadow-sky-500/15 transition"
          title="Export drawing as JSON file"
        >
          <Download size={14} />
          <span>Export JSON</span>
        </button>
      </div>
    </header>
  );
};
