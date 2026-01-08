import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Radio, Play, StopCircle, Trash2, Plus, Copy } from 'lucide-react';
import TerminalPanel from '../components/TerminalPanel';

const OUTPUT_CONFIGS = [
  { brand: 'ALLEN_BRADLEY', protocol: 'OPCUA', label: 'Allen-Bradley (OPC UA)' },
  { brand: 'SIEMENS', protocol: 'OPCUA', label: 'Siemens (OPC UA)' },
  { brand: 'SCHNEIDER', protocol: 'MODBUS_TCP', label: 'Schneider (Modbus TCP)' },
  { brand: 'GENERIC', protocol: 'OPCUA', label: 'Generic OPC UA PLC' },
  { brand: 'GENERIC', protocol: 'MODBUS_TCP', label: 'Generic Modbus PLC' },
];

export default function OutputPLCsPage() {
  const [plcs, setPlcs] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadPlcs();
  }, []);

  const loadPlcs = async () => {
    try {
      const res = await axios.get('/api/plcs');
      setPlcs(res.data.filter((p: any) => p.type === 'OUTPUT'));
    } catch (error) {
      console.error('Failed to load PLCs:', error);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await axios.post(`/api/plcs/${id}/start`);
      await loadPlcs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to start emulator');
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
    if (!confirm('Delete this PLC emulator?')) return;
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
            <span className="text-terminal-green">$</span> plc.output.list
          </h1>
          <p className="text-terminal-textDim text-sm">
            Configure PLC emulators (virtual outputs for dashboards)
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-terminal-cyan text-terminal-bg font-bold hover:bg-terminal-cyan/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          CREATE EMULATOR
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plcs.map((plc) => (
          <OutputPLCCard
            key={plc.id}
            plc={plc}
            onStart={handleStart}
            onStop={handleStop}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {plcs.length === 0 && (
        <TerminalPanel title="NO EMULATORS CONFIGURED">
          <div className="text-terminal-textDim text-sm">
            No output PLCs configured. Create an emulator to expose industrial data to external dashboards.
          </div>
        </TerminalPanel>
      )}

      {showCreateForm && (
        <CreateEmulatorModal
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

function OutputPLCCard({ plc, onStart, onStop, onDelete }: any) {
  const config = OUTPUT_CONFIGS.find(
    (c) => c.brand === plc.brand && c.protocol === plc.protocol
  );

  const copyEndpoint = () => {
    if (plc.endpoint) {
      navigator.clipboard.writeText(plc.endpoint);
      alert('Endpoint copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-terminal-bgLight border border-terminal-border p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-terminal-green" />
          <div>
            <div className="font-bold text-terminal-text">{plc.name}</div>
            <div className="text-xs text-terminal-textDim">
              {config?.label}
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

      {plc.endpoint && (
        <div className="mb-3 p-2 bg-terminal-bg border border-terminal-border">
          <div className="text-xs text-terminal-textDim mb-1">ENDPOINT:</div>
          <div className="flex items-center gap-2">
            <code className="text-xs text-terminal-cyan flex-1">
              {plc.endpoint}
            </code>
            <button
              onClick={copyEndpoint}
              className="text-terminal-textDim hover:text-terminal-cyan"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs mb-3">
        <span className="text-terminal-textDim">Mappings:</span>
        <span className="text-terminal-cyan">{plc._count?.mappings || 0}</span>
      </div>

      <div className="flex gap-2">
        {!plc.enabled ? (
          <button
            onClick={() => onStart(plc.id)}
            className="flex items-center gap-1 px-3 py-1 text-xs border border-terminal-green text-terminal-green hover:bg-terminal-green/10 transition-colors"
          >
            <Play className="w-3 h-3" />
            START
          </button>
        ) : (
          <button
            onClick={() => onStop(plc.id)}
            className="flex items-center gap-1 px-3 py-1 text-xs border border-terminal-yellow text-terminal-yellow hover:bg-terminal-yellow/10 transition-colors"
          >
            <StopCircle className="w-3 h-3" />
            STOP
          </button>
        )}
        <button
          onClick={() => onDelete(plc.id)}
          className="flex items-center gap-1 px-3 py-1 text-xs border border-terminal-red text-terminal-red hover:bg-terminal-red/10 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          DELETE
        </button>
      </div>
    </motion.div>
  );
}

function CreateEmulatorModal({ onClose, onSuccess }: any) {
  const [name, setName] = useState('');
  const [configIndex, setConfigIndex] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = OUTPUT_CONFIGS[configIndex];
      await axios.post('/api/plcs', {
        name,
        brand: config.brand,
        protocol: config.protocol,
        type: 'OUTPUT',
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create emulator:', error);
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
          <h3 className="text-terminal-cyan font-bold">CREATE OUTPUT EMULATOR</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-terminal-textDim mb-2">
              EMULATOR NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
              placeholder="e.g., Gateway OPC UA Server"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-terminal-textDim mb-2">
              EMULATE AS (BRAND + PROTOCOL)
            </label>
            <select
              value={configIndex}
              onChange={(e) => setConfigIndex(parseInt(e.target.value))}
              className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
            >
              {OUTPUT_CONFIGS.map((config, index) => (
                <option key={index} value={index}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-terminal-bg border border-terminal-border">
            <div className="text-xs text-terminal-textDim mb-2">
              This emulator will expose mapped tags via {OUTPUT_CONFIGS[configIndex].protocol}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-terminal-cyan text-terminal-bg py-2 font-bold hover:bg-terminal-cyan/80 transition-colors"
            >
              CREATE
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-terminal-border text-terminal-text py-2 hover:border-terminal-red hover:text-terminal-red transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
