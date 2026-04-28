import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { 
  CircleDollarSign, 
  Search,
  Filter,
  Download,
  Fingerprint,
  ShieldCheck,
  History,
  Lock,
  Unlock,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import colorVector from '../assets/color-vector.png';

interface TokenUnit {
  id: number;
  tokenHash: string;
  ownerId: number;
  status: 'ACTIVE' | 'SPENT' | 'REVOKED';
  createdAt: string;
  spentAt: string | null;
}

interface PageResponse {
  content: TokenUnit[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const RitzCirculation: React.FC = () => {
  const [tokens, setTokens] = useState<TokenUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchCirculation();
  }, [page, size]);

  const fetchCirculation = async () => {
    try {
      setIsLoading(true);
      const host = window.location.hostname;
      const res = await apiFetch(`http://${host}:8080/api/wallet/circulation?page=${page}&size=${size}`);
      const data: PageResponse = await res.json();
      
      setTokens(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching circulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTokens = tokens.filter(t => 
    t.tokenHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ownerId?.toString().includes(searchTerm)
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-inter animate-slideUp pb-24">
      {/* Regulated Header */}
      <div className="relative overflow-hidden bg-[#0d0d1e] rounded-3xl p-8 mb-8 text-white shadow-2xl border border-white/5">
        <img 
          src={colorVector} 
          alt="Vector BG" 
          className="absolute right-[-10%] top-[-20%] h-[150%] w-auto opacity-10 object-cover pointer-events-none"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20">
              <ShieldCheck size={32} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Ritz Forensic Ledger</h1>
              <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-red-500/20 rounded-full w-fit border border-red-500/20">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Strictly Regulated</span>
              </div>
            </div>
          </div>
          <p className="text-slate-400 max-w-lg font-medium mt-4">
            A comprehensive, non-repudiable audit trail of every individual Ritz unit. 
            Each token is uniquely serialized and traceable to its point of issuance.
          </p>
        </div>
      </div>

      {/* Circulation Stats - Summary level only as we now have pagination */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Fingerprint size={18} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Audit Population</span>
          </div>
          <h3 className="text-2xl font-black text-indigo-600">{totalElements.toLocaleString()} Units</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Unlock size={18} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Ledger Compliance</span>
          </div>
          <h3 className="text-2xl font-black text-emerald-600">100% Validated</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
              <History size={18} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Current View Range</span>
          </div>
          <h3 className="text-2xl font-black text-slate-600">Page {page + 1} / {totalPages || 1}</h3>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div>
            <h2 className="text-xl font-black text-slate-800">Circulation Audit</h2>
            <p className="text-sm text-slate-500 font-medium">Page {page + 1} of {totalPages} (Showing {tokens.length} records)</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Serial Hash..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all w-72 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 ml-2 pl-4">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || isLoading}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0d0d1e] text-white rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all ml-2">
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          {isLoading ? (
            <div className="p-24 flex flex-col items-center justify-center text-slate-400 uppercase tracking-widest text-xs font-black">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-red-500 rounded-full animate-spin mb-4" />
              <span>Verifying Ledger Integrity...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Transaction Unit ID</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Cryptographic Serial</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Owner UID</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Issuance Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTokens.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-black text-slate-400 font-mono">#{t.id.toString().padStart(6, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 px-2 bg-indigo-50 border border-indigo-100 rounded text-[11px] font-black text-indigo-700 font-mono">
                          {t.tokenHash}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Users size={14} className="opacity-40" />
                        {t.ownerId || 'SYSTEM'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 line-through'
                      }`}>
                        {t.status === 'ACTIVE' ? <Unlock size={10} /> : <Lock size={10} />}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                        <History size={14} className="opacity-40" />
                        {new Date(t.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination Footer - Sticky style */}
      <div className="fixed bottom-0 left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center items-center gap-4 z-40">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(0)}
            disabled={page === 0 || isLoading}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-black text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-all uppercase"
          >
            First
          </button>
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-md shadow-indigo-100"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          
          <div className="px-6 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 flex items-center gap-2 min-w-[140px] justify-center">
            {isLoading ? '...' : `Page ${page + 1} of ${totalPages || 1}`}
          </div>

          <button 
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || isLoading}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-md shadow-indigo-100"
          >
            Next <ChevronRight size={16} />
          </button>
          <button 
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1 || isLoading}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-black text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-all uppercase"
          >
            Last
          </button>
        </div>
      </div>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default RitzCirculation;
