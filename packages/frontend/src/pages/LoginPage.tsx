import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Terminal } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Terminal className="w-12 h-12 text-terminal-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-terminal-cyan mb-2">
            INDUSTRIAL GATEWAY PLATFORM
          </h1>
          <p className="text-terminal-textDim text-sm">
            Universal PLC Gateway & Emulator System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-terminal-bgLight border border-terminal-border p-8">
          <div className="mb-6">
            <div className="text-terminal-green text-sm mb-4">
              <span className="text-terminal-textDim">$</span> system.auth.login
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-terminal-textDim mb-2">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border px-4 py-3 text-terminal-text focus:border-terminal-cyan focus:outline-none transition-colors font-mono"
                placeholder="Enter username..."
                required
              />
            </div>

            <div>
              <label className="block text-xs text-terminal-textDim mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border px-4 py-3 text-terminal-text focus:border-terminal-cyan focus:outline-none transition-colors font-mono"
                placeholder="Enter password..."
                required
              />
            </div>

            {error && (
              <div className="bg-terminal-red/10 border border-terminal-red px-4 py-3 text-terminal-red text-sm">
                <span className="text-terminal-textDim">ERROR:</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-terminal-cyan hover:bg-terminal-cyan/80 text-terminal-bg font-bold py-3 transition-colors disabled:opacity-50"
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-terminal-border">
            <p className="text-xs text-terminal-textDim text-center">
              Default credentials: admin/admin123 or operator/operator123
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-terminal-textDim">
          <p>Secure industrial control plane access</p>
        </div>
      </motion.div>
    </div>
  );
}
