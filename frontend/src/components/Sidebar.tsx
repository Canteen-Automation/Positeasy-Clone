import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ChevronRight, 
  CreditCard, 
  Gauge, 
  LayoutGrid, 
  Megaphone, 
  MessageSquare, 
  ShoppingCart, 
  Store, 
  Table2, 
  Users, 
  Wallet,
  ShoppingBag,
  Receipt,
  Search,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import collegeLogo from '../assets/college-logo.png';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  subMenu?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: Gauge, path: '/dashboard' },
  { title: 'Store Dashboard', icon: LayoutGrid, path: '/store-dashboard' },
  { 
    title: 'Sale', 
    icon: Receipt, 
    subMenu: [
      { title: 'Orders', path: '/sale/orders' },
      { title: 'Archived Bills', path: '/sale/archived-bills' }
    ] 
  },
  { 
    title: 'Customers', 
    icon: Users, 
    subMenu: [
      { title: 'Orders', path: '/customers/orders' }
    ] 
  },
  { 
    title: 'Vendors', 
    icon: ShoppingBag, 
    subMenu: [
      { title: 'Dashboard', path: '/purchases/dashboard' },
      { title: 'Orders', path: '/purchases/orders' },
      { title: 'Summary', path: '/purchases/summary' },
      { title: 'Bills', path: '/purchases/bills' },
      { title: 'Vendors', path: '/purchases/vendor' },
      { title: 'Purchase Analytics', path: '/purchases/analytics' }
    ] 
  },
  { 
    title: 'Inventory', 
    icon: ShoppingCart, 
    subMenu: [
      { title: 'Base Items', path: '/inventory/base' },
      { title: 'Products', path: '/inventory/products' }
    ] 
  },
  { 
    title: 'Expense', 
    icon: Wallet, 
    subMenu: [
      { title: 'Overview', path: '/expense/overview' },
      { title: 'Category', path: '/expense/category' }
    ] 
  },
  { title: 'Reports', icon: BarChart3, path: '/reports' },
  { 
    title: 'Stores', 
    icon: Store, 
    subMenu: [
      { title: 'Terminals', path: '/stores/terminals' },
      { title: 'Managers', path: '/stores/managers' },
      { title: 'Staffs', path: '/stores/staffs' },
      { title: 'Stalls', path: '/stores/stalls' }
    ] 
  },
  { title: 'Table', icon: Table2, path: '/table' },
  { title: 'Wallet', icon: CreditCard, path: '/wallet' },
  { 
    title: 'Promotions', 
    icon: Megaphone, 
    subMenu: [
      { title: 'Discounts', path: '/promotions/discounts' },
      { title: 'Coupon', path: '/promotions/coupon' },
      { title: 'CouponTemplate', path: '/promotions/coupon-template' }
    ] 
  },
  { title: 'Feedback', icon: MessageSquare, path: '/feedback' },
];

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Permission Logic
  const userRole = sessionStorage.getItem('userRole') || 'master';
  const userPermissions = JSON.parse(sessionStorage.getItem('userPermissions') || '[]');

  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === 'master') return true;
    
    // Map title to permission ID
    const permissionMap: Record<string, string> = {
      'Dashboard': 'dashboard',
      'Store Dashboard': 'dashboard',
      'Sale': 'sale',
      'Customers': 'customers',
      'Vendors': 'purchases',
      'Inventory': 'inventory',
      'Expense': 'expense',
      'Reports': 'reports',
      'Stores': 'stores',
      'Table': 'table',
      'Wallet': 'wallet',
      'Promotions': 'promotions',
      'Feedback': 'feedback'
    };
    
    return userPermissions.includes(permissionMap[item.title]);
  });

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userPermissions');
    navigate('/login');
  };

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => 
      prev.includes(title) 
        ? prev.filter((item) => item !== title) 
        : [...prev, title]
    );
  };

  // Check if a sub-menu should be open based on the current location
  React.useEffect(() => {
    const currentMenu = menuItems.find(item => 
      item.subMenu?.some(sub => location.pathname.startsWith(sub.path))
    );
    if (currentMenu && !openMenus.includes(currentMenu.title)) {
      setOpenMenus(prev => [...prev, currentMenu.title]);
    }
  }, [location.pathname]);

  return (
    <div className="w-64 bg-white h-screen border-r border-[#e2e8f0] flex flex-col fixed left-0 top-0 z-50 shadow-sm overflow-hidden font-inter">
      {/* Branding Section */}
      <div className="px-5 pt-8 pb-4 flex items-center">
        <img src={collegeLogo} alt="Branding" className="h-14 w-auto object-contain brightness-[1.05]" />
      </div>
      
      {/* Premium Search Integration (Modern Dashboards usually have this) */}
      <div className="px-3 mb-4">
        <div className="relative flex items-center group">
          <div className="absolute left-3 flex items-center justify-center pointer-events-none">
            <Search size={16} className="text-[#64748b] group-focus-within:text-[#231651] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search Menu..." 
            title="Search for a specific module or page"
            className="w-full h-10 bg-gray-50 border border-[#e2e8f0] rounded-xl pl-10 pr-4 text-[13px] font-medium outline-none transition-all focus:bg-white focus:border-[#231651]/30 focus:shadow-sm placeholder:text-[#94a3b8] text-[#1e293b]"
          />
        </div>
      </div>

      {/* The main dashboard list starts here */}
      
      <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.title}>
              {item.subMenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    title={`Expand/Collapse ${item.title}`}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                      openMenus.includes(item.title) 
                        ? "text-[#521c4b] bg-[#521c4b]/5" 
                        : "text-[#475569] hover:bg-gray-50 hover:text-[#1e293b]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} strokeWidth={2} className={cn(
                        "transition-colors",
                        openMenus.includes(item.title) ? "text-[#231651]" : "text-[#64748b] group-hover:text-[#475569]"
                      )} />
                      <span className="tracking-tight">{item.title}</span>
                    </div>
                    <div className={cn(
                      "transition-transform duration-300",
                      openMenus.includes(item.title) ? "rotate-90" : ""
                    )}>
                      <ChevronRight size={14} className="opacity-60" />
                    </div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {openMenus.includes(item.title) && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="ml-6 mt-1 mb-2 space-y-0.5 border-l border-[#e2e8f0]/60 overflow-hidden"
                      >
                        {item.subMenu.map((sub) => (
                          <li key={sub.title}>
                            <NavLink
                              to={sub.path}
                              title={`Go to ${sub.title}`}
                              className={({ isActive }) => cn(
                                "flex items-center gap-3 py-2 px-4 rounded-lg text-[13px] font-medium transition-all group relative",
                                isActive 
                                  ? "text-white bg-[#521c4b] shadow-md shadow-[#521c4b]/10" 
                                  : "text-[#64748b] hover:text-[#1e293b] hover:translate-x-1"
                              )}
                            >
                              {({ isActive }) => (
                                <>
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    isActive ? "bg-[#231651] scale-125" : "bg-gray-300 group-hover:bg-gray-400"
                                  )} />
                                  <span>{sub.title}</span>
                                  {isActive && (
                                    <motion.div 
                                      layoutId="activeSubMenu"
                                      className="absolute left-[-1.5px] top-1/4 bottom-1/4 w-[3px] bg-[#231651] rounded-full"
                                    />
                                  )}
                                </>
                              )}
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  to={item.path!}
                  title={`Go to ${item.title}`}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 p-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                    isActive 
                      ? "bg-[#521c4b] text-white shadow-lg shadow-[#521c4b]/15" 
                      : "text-[#475569] hover:bg-gray-50 hover:text-[#1e293b]"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={18} strokeWidth={2} className={cn(
                        "transition-colors",
                        isActive ? "text-white" : "text-[#64748b] group-hover:text-[#475569]"
                      )} />
                      <span className="tracking-tight">{item.title}</span>
                    </>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 bg-gray-50/50 border-t border-[#e2e8f0]">
        <button 
          onClick={handleLogout}
          title="Sign out of your account"
          className="w-full flex items-center gap-3 p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all font-semibold text-sm group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      ` }} />
    </div>
  );
};

export default Sidebar;
