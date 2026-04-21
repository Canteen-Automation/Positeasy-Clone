import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  HelpCircle, 
  Calendar,
  LayoutDashboard,
  Store,
  ShoppingBag,
  History,
  Users,
  Package,
  Layers,
  FileText,
  MessageSquare,
  Wallet,
  Ticket,
  Cpu,
  UserCheck,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PAGES = [
  { label: 'General Dashboard', path: '/dashboard', category: 'Analytics', icon: <LayoutDashboard size={14} /> },
  { label: 'Store Dashboard', path: '/store-dashboard', category: 'Analytics', icon: <Store size={14} /> },
  { label: 'Active Orders', path: '/sale/orders', category: 'Sales', icon: <ShoppingBag size={14} /> },
  { label: 'Archived Bills', path: '/sale/archived-bills', category: 'Sales', icon: <History size={14} /> },
  { label: 'Manage Products', path: '/inventory/products', category: 'Inventory', icon: <Package size={14} /> },
  { label: 'Base Menu', path: '/inventory/base', category: 'Inventory', icon: <Layers size={14} /> },
  { label: 'Ritz Overview', path: '/ritz/overview', category: 'Finance', icon: <Wallet size={14} /> },
  { label: 'Manage Wallets', path: '/ritz/wallets', category: 'Finance', icon: <Users size={14} /> },
  { label: 'Coupon Codes', path: '/ritz/coupons', category: 'Finance', icon: <Ticket size={14} /> },
  { label: 'Reports & Analytics', path: '/reports', category: 'Support', icon: <FileText size={14} /> },
  { label: 'Customer Feedback', path: '/feedback', category: 'Support', icon: <MessageSquare size={14} /> },
  { label: 'Staff Management', path: '/stores/staffs', category: 'Team', icon: <UserCheck size={14} /> },
  { label: 'Store Terminals', path: '/stores/terminals', category: 'System', icon: <Cpu size={14} /> },
  { label: 'System Settings', path: '/settings', category: 'System', icon: <Settings size={14} /> },
];

const Header = () => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredPages = PAGES.filter(page => 
    page.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % filteredPages.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + filteredPages.length) % filteredPages.length);
    } else if (e.key === 'Enter' && filteredPages[selectedIndex]) {
      handleNavigate(filteredPages[selectedIndex].path);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative group w-full max-w-md" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#0f4475] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search pages, settings, or analytics..."
            className="w-full bg-gray-50 border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-[#0f4475]/30 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
          />

          <AnimatePresence>
            {showResults && searchTerm && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-[#e2e8f0] rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {filteredPages.length > 0 ? (
                  <div className="py-2">
                    {filteredPages.map((page, index) => (
                      <button
                        key={page.path}
                        onClick={() => handleNavigate(page.path)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-4 py-2.5 flex items-center justify-between transition-colors ${index === selectedIndex ? 'bg-[#0f4475]/5' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg transition-colors ${index === selectedIndex ? 'bg-[#0f4475] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {page.icon}
                          </div>
                          <div className="text-left">
                            <div className={`text-sm font-bold ${index === selectedIndex ? 'text-[#0f4475]' : 'text-slate-700'}`}>
                              {page.label}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest font-black opacity-40">
                              {page.category}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`transition-transform duration-300 ${index === selectedIndex ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} size={14} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <HelpCircle className="mx-auto text-slate-200 mb-2" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching pages found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
          
          <Link to="/settings" className="p-2 text-[#64748b] hover:text-[#0f4475] hover:bg-indigo-50 rounded-lg transition-all">
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
