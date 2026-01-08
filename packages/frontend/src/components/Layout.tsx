import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import {
  Activity,
  Cpu,
  Radio,
  GitBranch,
  FileText,
  LogOut,
  Circle
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'DASHBOARD', icon: Activity },
  { path: '/input-plcs', label: 'INPUT PLCs', icon: Cpu },
  { path: '/output-plcs', label: 'OUTPUT PLCs', icon: Radio },
  { path: '/mappings', label: 'MAPPINGS', icon: GitBranch },
  { path: '/logs', label: 'LOGS', icon: FileText },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { connect, disconnect, connected } = useSocketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      {/* Header */}
      <header className="border-b border-terminal-border bg-terminal-bgLight">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-terminal-cyan text-xl font-bold">
                <span className="text-terminal-green">$</span> INDUSTRIAL_GATEWAY
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Circle
                  className={`w-2 h-2 ${connected ? 'fill-terminal-green' : 'fill-terminal-red'}`}
                  strokeWidth={0}
                />
                <span className={connected ? 'text-terminal-green' : 'text-terminal-red'}>
                  {connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-terminal-textDim">user:</span>{' '}
                <span className="text-terminal-cyan">{user?.username}</span>
                <span className="text-terminal-textDim mx-2">|</span>
                <span className="text-terminal-textDim">role:</span>{' '}
                <span className="text-terminal-magenta">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1 text-xs border border-terminal-border hover:border-terminal-red hover:text-terminal-red transition-colors"
              >
                <LogOut className="w-3 h-3" />
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-6 border-t border-terminal-border">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  <div
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-terminal-cyan bg-terminal-bg'
                        : 'text-terminal-textDim hover:text-terminal-text'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-terminal-cyan"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-terminal-border bg-terminal-bgLight px-6 py-2">
        <div className="flex items-center justify-between text-xs text-terminal-textDim">
          <div>
            <span className="text-terminal-green">●</span> System operational
          </div>
          <div>
            Industrial Gateway Platform v1.0.0 | © 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
