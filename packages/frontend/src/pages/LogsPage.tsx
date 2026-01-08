import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSocketStore } from '../store/socketStore';
import { AlertCircle, Info, AlertTriangle, Filter } from 'lucide-react';
import TerminalPanel from '../components/TerminalPanel';

type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR';

export default function LogsPage() {
  const { logs } = useSocketStore();
  const [filter, setFilter] = useState<LogLevel>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.level === filter;
  });

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="w-3 h-3 text-terminal-red" />;
      case 'WARN':
        return <AlertTriangle className="w-3 h-3 text-terminal-yellow" />;
      default:
        return <Info className="w-3 h-3 text-terminal-green" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-terminal-red';
      case 'WARN':
        return 'text-terminal-yellow';
      default:
        return 'text-terminal-green';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-terminal-cyan mb-2">
            <span className="text-terminal-green">$</span> logs.stream
          </h1>
          <p className="text-terminal-textDim text-sm">
            Real-time system event log stream
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-terminal-textDim" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogLevel)}
            className="bg-terminal-bgLight border border-terminal-border px-3 py-1 text-terminal-text text-sm focus:border-terminal-cyan focus:outline-none"
          >
            <option value="ALL">ALL</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
      </div>

      <TerminalPanel title={`SYSTEM LOGS (${filteredLogs.length})`}>
        <div className="space-y-2 max-h-[700px] overflow-y-auto font-mono">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 text-xs p-2 hover:bg-terminal-bg transition-colors"
            >
              {getLogIcon(log.level)}

              <div className="flex-shrink-0 text-terminal-textDim w-20">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>

              <div className={`flex-shrink-0 w-14 ${getLogColor(log.level)}`}>
                [{log.level}]
              </div>

              <div className="flex-shrink-0 text-terminal-cyan w-32 truncate">
                {log.source}
              </div>

              <div className="flex-1 text-terminal-text">
                {log.message}
              </div>

              {log.metadata && (
                <button
                  onClick={() => console.log(JSON.parse(log.metadata))}
                  className="flex-shrink-0 text-terminal-textDim hover:text-terminal-cyan text-xs"
                >
                  [meta]
                </button>
              )}
            </motion.div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-terminal-textDim text-center py-8">
              No logs match the current filter...
            </div>
          )}
        </div>
      </TerminalPanel>

      {/* Log Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-terminal-bgLight border border-terminal-green p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-terminal-green" />
            <span className="text-xs text-terminal-textDim">INFO</span>
          </div>
          <div className="text-2xl text-terminal-green font-bold">
            {logs.filter((l) => l.level === 'INFO').length}
          </div>
        </div>

        <div className="bg-terminal-bgLight border border-terminal-yellow p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-terminal-yellow" />
            <span className="text-xs text-terminal-textDim">WARNINGS</span>
          </div>
          <div className="text-2xl text-terminal-yellow font-bold">
            {logs.filter((l) => l.level === 'WARN').length}
          </div>
        </div>

        <div className="bg-terminal-bgLight border border-terminal-red p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-terminal-red" />
            <span className="text-xs text-terminal-textDim">ERRORS</span>
          </div>
          <div className="text-2xl text-terminal-red font-bold">
            {logs.filter((l) => l.level === 'ERROR').length}
          </div>
        </div>
      </div>
    </div>
  );
}
