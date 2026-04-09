import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface PaginationProps {
  currentPage: number; // 0-indexed
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange
}) => {
  const totalPages = Math.ceil(totalElements / pageSize);
  const startRange = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endRange = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-end px-4 py-3 bg-white border-t border-slate-100 gap-8">
      {/* Rows per page */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows per page</span>
        <div className="relative group">
          <select 
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition-all"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* Range display */}
      <div className="text-xs font-bold text-slate-600 tracking-tight">
        {startRange}–{endRange} of <span className="font-black text-slate-900">{totalElements}</span>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`p-1.5 rounded-lg transition-all ${
            currentPage === 0 
              ? 'text-slate-200 cursor-not-allowed' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 active:scale-90'
          }`}
          title="Previous Page"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={`p-1.5 rounded-lg transition-all ${
            currentPage >= totalPages - 1 
              ? 'text-slate-200 cursor-not-allowed' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 active:scale-90'
          }`}
          title="Next Page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
