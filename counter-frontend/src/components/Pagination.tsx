import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
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
  const startElement = currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);

  if (totalElements === 0) return null;

  return (
    <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Show</span>
        <select 
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none pr-8 relative"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
        >
          {[5, 10, 25, 50].map(size => (
            <option key={size} value={size}>{size} items</option>
          ))}
        </select>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
          {startElement}-{endElement} of {totalElements} units
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button 
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-10 h-10 font-bold text-xs rounded-xl transition-all ${
                currentPage === i 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          )).slice(Math.max(0, currentPage - 1), Math.min(totalPages, currentPage + 2))}
        </div>

        <button 
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
