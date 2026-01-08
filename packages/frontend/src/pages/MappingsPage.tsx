import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GitBranch, Plus, Trash2, ArrowRight } from 'lucide-react';
import TerminalPanel from '../components/TerminalPanel';

export default function MappingsPage() {
  const [mappings, setMappings] = useState<any[]>([]);
  const [inputPlcs, setInputPlcs] = useState<any[]>([]);
  const [outputPlcs, setOutputPlcs] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadMappings();
    loadPlcs();
  }, []);

  const loadMappings = async () => {
    try {
      const res = await axios.get('/api/mappings');
      setMappings(res.data);
    } catch (error) {
      console.error('Failed to load mappings:', error);
    }
  };

  const loadPlcs = async () => {
    try {
      const res = await axios.get('/api/plcs');
      setInputPlcs(res.data.filter((p: any) => p.type === 'INPUT'));
      setOutputPlcs(res.data.filter((p: any) => p.type === 'OUTPUT'));
    } catch (error) {
      console.error('Failed to load PLCs:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this mapping?')) return;
    try {
      await axios.delete(`/api/mappings/${id}`);
      await loadMappings();
    } catch (error) {
      console.error('Failed to delete mapping:', error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-terminal-cyan mb-2">
            <span className="text-terminal-green">$</span> mapping.list
          </h1>
          <p className="text-terminal-textDim text-sm">
            Configure tag mappings from input PLCs to output emulators
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-terminal-cyan text-terminal-bg font-bold hover:bg-terminal-cyan/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          CREATE MAPPING
        </button>
      </div>

      <div className="space-y-4">
        {mappings.map((mapping) => (
          <MappingCard
            key={mapping.id}
            mapping={mapping}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {mappings.length === 0 && (
        <TerminalPanel title="NO MAPPINGS CONFIGURED">
          <div className="text-terminal-textDim text-sm">
            No mappings configured. Create a mapping to route data from input PLCs to output emulators.
          </div>
        </TerminalPanel>
      )}

      {showCreateForm && (
        <CreateMappingModal
          inputPlcs={inputPlcs}
          outputPlcs={outputPlcs}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadMappings();
          }}
        />
      )}
    </div>
  );
}

function MappingCard({ mapping, onDelete }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-terminal-bgLight border border-terminal-border p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-terminal-magenta" />
          <span className={`text-xs px-2 py-1 ${
            mapping.enabled
              ? 'bg-terminal-green/20 text-terminal-green'
              : 'bg-terminal-textDim/20 text-terminal-textDim'
          }`}>
            {mapping.enabled ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>
        <button
          onClick={() => onDelete(mapping.id)}
          className="text-terminal-red hover:text-terminal-red/80"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Input */}
        <div className="p-3 bg-terminal-bg border border-terminal-border">
          <div className="text-xs text-terminal-textDim mb-1">INPUT</div>
          <div className="text-sm text-terminal-cyan">
            {mapping.inputTag.plc.name}
          </div>
          <div className="text-xs text-terminal-text mt-1">
            {mapping.inputTag.name}
          </div>
        </div>

        {/* Transform */}
        <div className="flex flex-col items-center gap-2">
          <ArrowRight className="w-5 h-5 text-terminal-magenta" />
          <div className="text-xs text-terminal-textDim">
            × {mapping.scaleFactor} + {mapping.offset}
          </div>
        </div>

        {/* Output */}
        <div className="p-3 bg-terminal-bg border border-terminal-border">
          <div className="text-xs text-terminal-textDim mb-1">OUTPUT</div>
          <div className="text-sm text-terminal-green">
            {mapping.outputPlc.name}
          </div>
          <div className="text-xs text-terminal-text mt-1">
            {mapping.outputTagName}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreateMappingModal({ inputPlcs, outputPlcs, onClose, onSuccess }: any) {
  const [selectedInputPlc, setSelectedInputPlc] = useState('');
  const [selectedInputTag, setSelectedInputTag] = useState('');
  const [selectedOutputPlc, setSelectedOutputPlc] = useState('');
  const [outputTagName, setOutputTagName] = useState('');
  const [outputAddress, setOutputAddress] = useState('');
  const [scaleFactor, setScaleFactor] = useState('1.0');
  const [offset, setOffset] = useState('0.0');

  const [inputTags, setInputTags] = useState<any[]>([]);

  useEffect(() => {
    if (selectedInputPlc) {
      loadInputTags(selectedInputPlc);
    }
  }, [selectedInputPlc]);

  const loadInputTags = async (plcId: string) => {
    try {
      const res = await axios.get(`/api/tags/plc/${plcId}`);
      setInputTags(res.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/mappings', {
        inputTagId: selectedInputTag,
        outputPlcId: selectedOutputPlc,
        outputTagName,
        outputAddress,
        scaleFactor: parseFloat(scaleFactor),
        offset: parseFloat(offset),
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create mapping:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-terminal-bgLight border border-terminal-cyan max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="border-b border-terminal-border p-4">
          <h3 className="text-terminal-cyan font-bold">CREATE TAG MAPPING</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Input Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-terminal-textDim mb-2">
                INPUT PLC
              </label>
              <select
                value={selectedInputPlc}
                onChange={(e) => setSelectedInputPlc(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
                required
              >
                <option value="">Select PLC...</option>
                {inputPlcs.map((plc: any) => (
                  <option key={plc.id} value={plc.id}>
                    {plc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-terminal-textDim mb-2">
                INPUT TAG
              </label>
              <select
                value={selectedInputTag}
                onChange={(e) => setSelectedInputTag(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
                required
                disabled={!selectedInputPlc}
              >
                <option value="">Select tag...</option>
                {inputTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-terminal-textDim mb-2">
                SCALE FACTOR
              </label>
              <input
                type="number"
                step="0.01"
                value={scaleFactor}
                onChange={(e) => setScaleFactor(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-terminal-textDim mb-2">
                OFFSET
              </label>
              <input
                type="number"
                step="0.01"
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
              />
            </div>
          </div>

          {/* Output */}
          <div>
            <label className="block text-xs text-terminal-textDim mb-2">
              OUTPUT PLC (EMULATOR)
            </label>
            <select
              value={selectedOutputPlc}
              onChange={(e) => setSelectedOutputPlc(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
              required
            >
              <option value="">Select emulator...</option>
              {outputPlcs.map((plc: any) => (
                <option key={plc.id} value={plc.id}>
                  {plc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-terminal-textDim mb-2">
                OUTPUT TAG NAME
              </label>
              <input
                type="text"
                value={outputTagName}
                onChange={(e) => setOutputTagName(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
                placeholder="e.g., Temperature_01"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-terminal-textDim mb-2">
                OUTPUT ADDRESS
              </label>
              <input
                type="text"
                value={outputAddress}
                onChange={(e) => setOutputAddress(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border px-3 py-2 text-terminal-text focus:border-terminal-cyan focus:outline-none"
                placeholder="e.g., ns=1;s=Temp01"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-terminal-cyan text-terminal-bg py-2 font-bold hover:bg-terminal-cyan/80 transition-colors"
            >
              CREATE MAPPING
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
