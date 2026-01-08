import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TerminalPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function TerminalPanel({ title, children, className = '' }: TerminalPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-terminal-bgLight border border-terminal-border ${className}`}
    >
      {/* Header */}
      <div className="border-b border-terminal-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-terminal-red"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-terminal-green"></div>
          </div>
          <span className="text-xs text-terminal-textDim ml-2">{title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </motion.div>
  );
}
