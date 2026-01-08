import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSocketStore } from '../store/socketStore';
import { Cpu, Play, StopCircle, Trash2, Plus } from 'lucide-react';
import TerminalPanel from '../components/TerminalPanel';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const BRANDS = [
  { value: 'SIEMENS', label: 'Siemens', protocol: 'S7COMM' },
  { value: 'ALLEN_BRADLEY', label: 'Allen-Bradley', protocol: 'ETHERNET_IP' },
  { value: 'SCHNEIDER', label: 'Schneider', protocol: 'MODBUS_TCP' },
  { value: 'OMRON', label: 'Omron', protocol: 'FINS' },
  { value: 'GENERIC', label: 'Generic Legacy', protocol: 'MODBUS_RTU' },
];

export default function InputPLCsPage() {
  const [plcs, setPlcs] = useState<any[]>([]);
  const [selectedPlc, setSelectedPlc] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { tagUpdates } = useSocketStore();

  useEffect(() => {
    loadPlcs();
  }, []);

  const loadPlcs = async () => {
    try {
      const res = await axios.get('/api/plcs');
      setPlcs(res.data.filter((p: any) => p.type === 'INPUT'));
    } catch (error) {
      console.error('Failed to load PLCs:', error);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await axios.post(`/api/plcs/${id}/start`);
      await loadPlcs();
    } catch (error) {
      console.error('Failed to start PLC:', error);
    }
  };

  const handleStop = async (id: string) => {
    try {
      await axios.post(`/api/plcs/${id}/stop`);
      await loadPlcs();
    } catch (error) {
      console.error('Failed to stop PLC:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this PLC and all its tags?')) return;
    try {
      await axios.delete(`/api/plcs/${id}`);
      await loadPlcs();
    } catch (error) {
      console.error('Failed to delete PLC:', error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-terminal-cyan mb-2">
            <span className="text-terminal-green">$</span> plc.input.list
          </h1>
          <p className="text-terminal-textDim text-sm">
            Manage simulated input PLCs (data sources)
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-terminal-cyan text-terminal-bg font-bold hover:bg-terminal-cyan/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          CREATE PLC
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PLC List */}
        <div className="lg:col-span-2 space-y-4">
          {plcs.map((plc) => (
            <PLCCard
              key={plc.id}
              plc={plc}
              onStart={handleStart}
              onStop={handleStop}
              onDelete={handleDelete}
              onSelect={setSelectedPlc}
              isSelected={selectedPlc?.id === plc.id}
            />
          ))}

          {plcs.length === 0 && (
            <TerminalPanel title="NO PLCs CONFIGURED">
              <div className="text-terminal-textDim text-sm">
                No input PLCs configured. Create one to start simulating industrial data.
              </div>
            </TerminalPanel>
          )}
        </div>

        {/* Tag Details */}
        <div>
          {selectedPlc && (
            <TagViewer plc={selectedPlc} tagUpdates={tagUpdates} />
          )}
        </div>
      </div>

      {showCreateForm && (
        <CreatePLCModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadPlcs();
          }}
        />
      )}
    </div>
  );
}

function PLCCard({ plc, onStart, onStop, onDelete, onSelect, isSelected }: any) {
  const brand = BRANDS.find((b) => b.value === plc.brand);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(plc)}
      className={`bg-terminal-bgLight border ${
        isSelected ? 'border-terminal-cyan' : 'border-terminal-border'
      } p-4 cursor-pointer hover:border-terminal-cyan/50 transition-colors`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-terminal-cyan" />
          <div>
            <div className="font-bold text-terminal-text">{plc.name}</div>
            <div className="text-xs text-terminal-textDim">
              {brand?.label} | {brand?.protocol}
            </div>
          </div>
        </div>
        <div className={`text-xs px-2 py-1 ${
          plc.enabled
            ? 'bg-terminal-green/20 text-terminal-green'
            : 'bg-terminal-textDim/20 text-terminal-textDim'
        }`}>
          {plc.enabled ? 'RUNNING' : 'STOPPED'}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-terminal-textDim">Tags:</span>
        <span className="text-terminal-cyan">{plc._count?.tags || 0}</span>
      </div>

      <div className="flex gap-2 mt-4">
        {!plc.enabled ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart(plc.id);
            }}
            className="flex items-center gap-1 px-3 py-1 text-xs border border-terminal-green text-terminal-green hover:bg-terminal-green/10 transition-colors"
          >
            <Play className="w-3 h-3" />
            START
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStop(plc.id);
            }}
            className="flex items-center gap-1 px-3 py-1 text-xs border border-terminal-yellow text-terminal-yellow hover:bg-terminal-yellow/10 transition-colors"
          >
            <StopCircle className="w-3 h-3" />
            STOP
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(plc.id);
          }}
          className="flex items-center gap-1 px-3 py-1 text-xs border border-terminal-red text-terminal-red hover:bg-terminal-red/10 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          DELETE
        </button>
      </div>
    </motion.div>
  );
}

function TagViewer({ plc, tagUpdates }: any) {
  const [tags, setTags] = useState<any[]>([]);
  const [history, setHistory] = useState<Map<string, any[]>>(new Map());

  useEffect(() => {
    loadTags();
  }, [plc.id]);

  useEffect(() => {
    // Update history with real-time data
    tagUpdates.forEach((update: any, tagId: string) => {
      const tag = tags.find((t) => t.id === tagId);
      if (tag && tag.plcId === plc.id) {
        setHistory((prev) => {
          const newHistory = new Map(prev);
          const tagHistory = newHistory.get(tagId) || [];
          tagHistory.push({
            time: new Date().toLocaleTimeString(),
            value: update.value,
          });
          if (tagHistory.length > 20) tagHistory.shift();
          newHistory.set(tagId, tagHistory);
          return newHistory;
        });
      }
    });
  }, [tagUpdates, tags]);

  const loadTags = async () => {
    try {
      const res = await axios.get(`/api/tags/plc/${plc.id}`);
      setTags(res.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  return (
    <TerminalPanel title={`TAGS: ${plc.name}`}>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {tags.map((tag) => {
          const update = tagUpdates.get(tag.id);
          const chartData = history.get(tag.id) || [];

          return (
            <div key={tag.id} className="border border-terminal-border p-3">
              <div className="font-bold text-terminal-cyan text-sm mb-1">
                {tag.name}
              </div>
              <div className="text-xs text-terminal-textDim mb-2">
                {tag.address} | {tag.signalType}
              </div>
              <div className="text-xl text-terminal-green mb-2">
                {update?.value?.toFixed(2) || tag.value.toFixed(2)}{' '}
                <span className="text-xs text-terminal-textDim">{tag.unit}</span>
              </div>

              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00d9ff"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          );
        })}
      </div>
    </TerminalPanel>
  );
}

function CreatePLCModal({ onClose, onSuccess }: any) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('SIEMENS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const selectedBrand = BRANDS.find((b) => b.value === brand)!;
      const response = await axios.post('/api/plcs', {
        name,
        brand: selectedBrand.value,
        protocol: selectedBrand.protocol,
        type: 'INPUT',
      });

      console.log('PLC created successfully:', response.data);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create PLC:', error);
      const errorMessage = error.response?.data?.details ||
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to create PLC. Please try again.';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-terminal-bgLight border border-terminal-cyan max-w-md w-full"
      >
        <div className="border-b border-terminal-border p-4">
          <h3 className="text-terminal-cyan font-bold">CREATE INPUT PLC</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-terminal-red/20 border border-terminal-red p-3 text-terminal-red text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-terminal-textDim mb-2">
              PLC NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs text-terminal-textDim mb-2">
              BRAND + PROTOCOL
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
              disabled={loading}
            >
              {BRANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label} ({b.protocol})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-terminal-cyan text-terminal-bg py-2 font-bold hover:bg-terminal-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'CREATING...' : 'CREATE'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-terminal-border text-terminal-text py-2 hover:border-terminal-red hover:text-terminal-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CANCEL
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
