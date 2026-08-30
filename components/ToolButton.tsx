import React from 'react';

export type ToolButtonProps = {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  variant?: 'default' | 'danger' | 'accent';
};

export const ToolButton: React.FC<ToolButtonProps> = ({
  active = false,
  disabled = false,
  onClick,
  icon,
  label,
  shortcut,
  variant = 'default',
}) => {
  let baseClasses =
    'relative inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500/50 select-none';

  if (disabled) {
    baseClasses += ' opacity-40 cursor-not-allowed bg-slate-800/40 text-slate-500';
  } else if (active) {
    if (variant === 'accent') {
      baseClasses += ' bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20';
    } else {
      baseClasses += ' bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20';
    }
  } else {
    if (variant === 'danger') {
      baseClasses +=
        ' bg-slate-800/80 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-900/40';
    } else if (variant === 'accent') {
      baseClasses +=
        ' bg-slate-800/80 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 border border-amber-900/40';
    } else {
      baseClasses +=
        ' bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50';
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      className={baseClasses}
    >
      <span className="w-4 h-4 flex items-center justify-center shrink-0">{icon}</span>
      <span>{label}</span>
      {shortcut && !disabled && (
        <span
          className={`ml-1 text-[10px] px-1 py-0.5 rounded ${
            active ? 'bg-slate-900/20 text-slate-900' : 'bg-slate-900/60 text-slate-400'
          }`}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
};
