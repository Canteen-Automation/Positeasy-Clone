import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Plus, 
  MapPin, 
  ShieldCheck, 
  Trash2, 
  Search,
  ExternalLink,
  Info,
  Key
} from 'lucide-react';
import AddTerminalModal from '../components/AddTerminalModal.tsx';
import PinVerificationModal from '../components/PinVerificationModal.tsx';

interface Terminal {
  id: number;
  name: string;
  location: string;
  apiKey: string;
}

const Terminals = () => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);

  const fetchTerminals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/terminals');
      if (response.ok) {
        const data = await response.json();
        setTerminals(data);
      }
    } catch (error) {
      console.error('Failed to fetch terminals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerminals();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this terminal?')) {
      try {
        const response = await fetch(`/api/terminals/${id}`, { method: 'DELETE' });
        if (response.ok) fetchTerminals();
      } catch (error) {
        console.error('Failed to delete terminal:', error);
      }
    }
  };

  const filteredTerminals = terminals.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-inter">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">Physical Terminals</h1>
          <p className="text-[#64748b] mt-1 font-medium">Manage counter devices and device authentication keys</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#231651] text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-[#231651]/20 hover:bg-[#2d1d66] transition-all"
        >
          <Plus size={20} />
          Add Terminal
        </motion.button>
      </div>

      {/* Stats/Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#231651] to-[#3d2b7a] p-6 rounded-3xl text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Monitor size={24} />
            </div>
            <div>
              <p className="text-white/60 text-sm font-medium">Active Devices</p>
              <p className="text-2xl font-bold">{terminals.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">System Status</p>
            <p className="text-xl font-bold text-gray-900 border-b-2 border-green-500 inline-block leading-tight">Secure & Online</p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-3xl flex items-center gap-4 border border-blue-100">
          <Info size={24} className="text-blue-600 shrink-0" />
          <p className="text-sm text-blue-700 font-medium leading-relaxed">
            Terminals are used at physical counters to scan order QRs and print bills.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center group focus-within:ring-2 focus-within:ring-[#231651]/10 transition-all">
        <div className="p-3">
          <Search size={20} className="text-gray-400 group-focus-within:text-[#231651] transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search by terminal name or location..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Grid of Terminals */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredTerminals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerminals.map((terminal) => (
            <motion.div
              layout
              key={terminal.id}
              whileHover={{ y: -5 }}
              onClick={() => {
                setSelectedTerminal(terminal);
                setIsPinModalOpen(true);
              }}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#231651]/5 transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Card Background Pattern */}
              <div className="absolute -right-8 -top-8 text-[#231651]/5 rotate-12 transition-transform group-hover:rotate-0 duration-500">
                <Monitor size={140} />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-4 bg-gray-50 text-[#231651] rounded-2xl border border-gray-200 group-hover:bg-[#231651] group-hover:text-white transition-colors duration-300">
                    <Monitor size={28} />
                  </div>
                  <button
                    onClick={(e) => handleDelete(terminal.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#231651] transition-colors">{terminal.name}</h4>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1 font-medium text-sm">
                    <MapPin size={14} />
                    <span>{terminal.location}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Device Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#231651] font-bold text-sm">
                    <Key size={16} />
                    <span>View API Key</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="p-6 bg-white rounded-full shadow-sm mb-4">
            <Monitor size={48} className="text-gray-300" />
          </div>
          <p className="text-lg font-bold text-gray-900">No terminals found</p>
          <p className="text-gray-500 max-w-xs text-center mt-1">Start by adding your first counter device terminal to manage device authentication.</p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="mt-6 text-[#231651] font-bold hover:underline underline-offset-4"
          >
            Add your first terminal
          </button>
        </div>
      )}

      {/* Modals */}
      <AddTerminalModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTerminals}
      />

      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setSelectedTerminal(null);
        }}
        terminalId={selectedTerminal?.id || null}
        terminalName={selectedTerminal?.name || ''}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      ` }} />
    </div>
  );
};

export default Terminals;
