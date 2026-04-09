import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowUpRight,
  Package,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const data = [
  { month: 'Jan', purchases: 4500, orders: 12 },
  { month: 'Feb', purchases: 5200, orders: 15 },
  { month: 'Mar', purchases: 4800, orders: 14 },
  { month: 'Apr', purchases: 6100, orders: 18 },
  { month: 'May', purchases: 5500, orders: 16 },
  { month: 'Jun', purchases: 6700, orders: 20 },
];

const StatCard = ({ title, value, change, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={20} />
      </div>
      <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
        <ArrowUpRight size={10} />
        {change}%
      </div>
    </div>
    <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-xl font-black text-[#1e293b]">{value}</h3>
  </motion.div>
);

const VendorDashboard = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#231651] tracking-tight">Vendor Dashboard</h1>
          <p className="text-[#64748b] text-sm font-medium">Monitoring procurement, supplier health, and order cycles.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#1e293b] hover:bg-gray-50 flex items-center gap-2">
                <Clock size={14} /> Last 30 Days
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Procurement" value="$28,450.00" change={12} icon={DollarSign} color="bg-blue-500" delay={0.1} />
        <StatCard title="Active Vendors" value="24" change={5} icon={Users} color="bg-emerald-500" delay={0.2} />
        <StatCard title="Pending POs" value="08" change={2} icon={Package} color="bg-amber-500" delay={0.3} />
        <StatCard title="Supply Fill Rate" value="94.2%" change={1.5} icon={TrendingUp} color="bg-violet-500" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#1e293b] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#231651]" />
                Purchase Trends
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#231651" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#231651" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip />
                <Area type="monotone" dataKey="purchases" stroke="#231651" strokeWidth={3} fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#1e293b] flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#231651]" />
                Orders by Volume
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip />
                <Bar dataKey="orders" fill="#231651" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm p-6 overflow-hidden">
          <h3 className="text-lg font-bold text-[#1e293b] mb-6">Top Performing Vendors</h3>
          <div className="space-y-4">
              {[
                { name: 'Fresh Foods Co.', orders: 45, volume: '$12,400', color: 'bg-blue-100 text-blue-600' },
                { name: 'Dairy Plus', orders: 28, volume: '$8,200', color: 'bg-emerald-100 text-emerald-600' },
                { name: 'Bakery World', orders: 15, volume: '$3,150', color: 'bg-amber-100 text-amber-600' },
              ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${v.color} flex items-center justify-center font-bold text-sm`}>
                              {v.name.charAt(0)}
                          </div>
                          <div>
                              <p className="text-sm font-bold text-[#1e293b] group-hover:text-[#231651] transition-colors">{v.name}</p>
                              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{v.orders} Orders this month</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-sm font-black text-[#1e293b]">{v.volume}</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">Excellent Status</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
