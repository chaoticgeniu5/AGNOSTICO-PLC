import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSocketStore } from '../store/socketStore';
import {
  Activity,
  Cpu,
  Radio,
  TrendingUp
} from 'lucide-react';
import TerminalPanel from '../components/TerminalPanel';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    inputPlcs: 0,
    outputPlcs: 0,
    activeMappings: 0,
    totalTags: 0,
  });

  const { logs } = useSocketStore();

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [plcsRes, mappingsRes] = await Promise.all([
        axios.get('/api/plcs'),
        axios.get('/api/mappings'),
      ]);

      const plcs = plcsRes.data;
      const mappings = mappingsRes.data;

      setStats({
        inputPlcs: plcs.filter((p: any) => p.type === 'INPUT').length,
        outputPlcs: plcs.filter((p: any) => p.type === 'OUTPUT').length,
        activeMappings: mappings.filter((m: any) => m.enabled).length,
        totalTags: plcs.reduce((sum: number, p: any) => sum + (p._count?.tags || 0), 0),
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-terminal-cyan mb-2">
          <span className="text-terminal-green">$</span> system.status
        </h1>
        <p className="text-terminal-textDim text-sm">
          Real-time industrial gateway monitoring and control
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Cpu}
          label="INPUT PLCs"
          value={stats.inputPlcs}
          color="cyan"
        />
        <StatCard
          icon={Radio}
          label="OUTPUT PLCs"
          value={stats.outputPlcs}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="ACTIVE MAPPINGS"
          value={stats.activeMappings}
          color="magenta"
        />
        <StatCard
          icon={Activity}
          label="TOTAL TAGS"
          value={stats.totalTags}
          color="yellow"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Logs */}
        <TerminalPanel title="SYSTEM LOGS">
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.slice(0, 50).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 text-xs font-mono"
              >
                <span className="text-terminal-textDim">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={
                    log.level === 'ERROR'
                      ? 'text-terminal-red'
                      : log.level === 'WARN'
                      ? 'text-terminal-yellow'
                      : 'text-terminal-green'
                  }
                >
                  [{log.level}]
                </span>
                <span className="text-terminal-textDim">{log.source}:</span>
                <span className="text-terminal-text">{log.message}</span>
              </motion.div>
            ))}
            {logs.length === 0 && (
              <div className="text-terminal-textDim text-xs">
                No logs available...
              </div>
            )}
          </div>
        </TerminalPanel>

        {/* Quick Actions */}
        <TerminalPanel title="QUICK ACTIONS">
          <div className="space-y-3">
            <QuickAction
              command="plc.input.list"
              description="View all input PLCs"
              href="/input-plcs"
            />
            <QuickAction
              command="plc.output.configure"
              description="Configure output emulators"
              href="/output-plcs"
            />
            <QuickAction
              command="mapping.create"
              description="Create tag mappings"
              href="/mappings"
            />
            <QuickAction
              command="logs.view"
              description="View detailed system logs"
              href="/logs"
            />
          </div>
        </TerminalPanel>
      </div>

      {/* System Info */}
      <TerminalPanel title="SYSTEM INFORMATION">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-terminal-textDim mb-1">VERSION</div>
            <div className="text-terminal-cyan">v1.0.0</div>
          </div>
          <div>
            <div className="text-terminal-textDim mb-1">UPTIME</div>
            <div className="text-terminal-green">RUNNING</div>
          </div>
          <div>
            <div className="text-terminal-textDim mb-1">STATUS</div>
            <div className="text-terminal-green flex items-center gap-2">
              <Activity className="w-3 h-3" />
              OPERATIONAL
            </div>
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}

function QuickAction({
  command,
  description,
  href,
}: {
  command: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block border border-terminal-border hover:border-terminal-cyan transition-colors p-3 group"
    >
      <div className="text-terminal-cyan text-sm mb-1 font-mono">
        <span className="text-terminal-green">$</span> {command}
      </div>
      <div className="text-terminal-textDim text-xs group-hover:text-terminal-text transition-colors">
        {description}
      </div>
    </a>
  );
}
