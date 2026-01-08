import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: 'cyan' | 'green' | 'magenta' | 'yellow' | 'red';
}

const colorMap = {
  cyan: 'text-terminal-cyan border-terminal-cyan',
  green: 'text-terminal-green border-terminal-green',
  magenta: 'text-terminal-magenta border-terminal-magenta',
  yellow: 'text-terminal-yellow border-terminal-yellow',
  red: 'text-terminal-red border-terminal-red',
};

export default function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-terminal-bgLight border ${colorMap[color]} p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${colorMap[color].split(' ')[0]}`} />
        <span className="text-xs text-terminal-textDim">{label}</span>
      </div>
      <div className={`text-3xl font-bold ${colorMap[color].split(' ')[0]}`}>
        {value}
      </div>
    </motion.div>
  );
}
