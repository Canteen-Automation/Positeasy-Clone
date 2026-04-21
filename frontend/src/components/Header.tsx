import { Bell, Search, Settings, HelpCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#231651] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search dashboard..."
            className="w-full bg-gray-50 border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-[#231651]/30 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 text-[#64748b] text-sm">
          <Calendar size={16} />
          <span>{currentDate}</span>
        </div>

        <div className="flex items-center gap-4 border-l border-[#e2e8f0] pl-6">
          <button className="relative p-2 text-[#64748b] hover:text-[#1e293b] hover:bg-gray-100 rounded-lg transition-all group">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <Link to="/settings" className="p-2 text-[#64748b] hover:text-[#231651] hover:bg-indigo-50 rounded-lg transition-all">
            <Settings size={20} />
          </Link>
          
          <button className="p-2 text-[#64748b] hover:text-[#1e293b] hover:bg-gray-100 rounded-lg transition-all">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
