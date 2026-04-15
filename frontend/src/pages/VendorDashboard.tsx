import { useState, useEffect } from 'react';
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
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { format, subMonths, startOfMonth } from 'date-fns';

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
  const [stats, setStats] = useState({
    totalProcurement: 0,
    activeVendors: 0,
    pendingPOs: 0,
    fillRate: 94.2
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [topVendors, setTopVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendorStats = async () => {
      try {
        setIsLoading(true);
        const [vendorsSnap, purchasesSnap] = await Promise.all([
          getDocs(collection(db, 'vendors')),
          getDocs(collection(db, 'purchases'))
        ]);

        const vendors: any[] = [];
        vendorsSnap.forEach(doc => vendors.push({ id: doc.id, ...doc.data() }));

        const purchases: any[] = [];
        purchasesSnap.forEach(doc => purchases.push({ id: doc.id, ...doc.data() }));

        // Totals
        const totalProcurement = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingPOs = purchases.filter(p => p.status === 'PENDING').length;

        // Monthly Trends (Last 6 months)
        const trendMap: { [key: string]: { month: string, purchases: number, orders: number } } = {};
        for (let i = 5; i >= 0; i--) {
          const m = format(subMonths(new Date(), i), 'MMM');
          trendMap[m] = { month: m, purchases: 0, orders: 0 };
        }

        purchases.forEach(p => {
          const m = format(new Date(p.date), 'MMM');
          if (trendMap[m]) {
            trendMap[m].purchases += p.amount;
            trendMap[m].orders += 1;
          }
        });
        setChartData(Object.values(trendMap));

        // Top Vendors
        const vMap: { [key: string]: any } = {};
        purchases.forEach(p => {
          const vName = p.vendor?.name || 'Unknown';
          if (!vMap[vName]) vMap[vName] = { name: vName, orders: 0, volume: 0 };
          vMap[vName].orders += 1;
          vMap[vName].volume += p.amount;
        });

        const sortedVendors = Object.values(vMap)
          .sort((a: any, b: any) => b.volume - a.volume)
          .slice(0, 3)
          .map((v: any) => ({
            ...v,
            volume: `₹${v.volume.toLocaleString()}`,
            color: 'bg-blue-100 text-blue-600'
          }));

        setTopVendors(sortedVendors);
        setStats({
          totalProcurement,
          activeVendors: vendors.length,
          pendingPOs,
          fillRate: 98.5
        });

      } catch (error) {
        console.error('Error fetching vendor dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendorStats();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#231651]"></div>
      </div>
    );
  }
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
        <StatCard title="Total Procurement" value={`₹${stats.totalProcurement.toLocaleString()}`} change={12} icon={DollarSign} color="bg-blue-500" delay={0.1} />
        <StatCard title="Active Vendors" value={stats.activeVendors.toString()} change={5} icon={Users} color="bg-emerald-500" delay={0.2} />
        <StatCard title="Pending POs" value={stats.pendingPOs.toString().padStart(2, '0')} change={2} icon={Package} color="bg-amber-500" delay={0.3} />
        <StatCard title="Supply Fill Rate" value={`${stats.fillRate}%`} change={1.5} icon={TrendingUp} color="bg-violet-500" delay={0.4} />
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
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#231651" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#231651" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} tickFormatter={(v) => `₹${v/1000}k`} />
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
              <BarChart data={chartData}>
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
              {topVendors.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No vendor data available</p>
              ) : (
                topVendors.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${v.color} flex items-center justify-center font-bold text-sm`}>
                              {v.name.charAt(0)}
                          </div>
                          <div>
                              <p className="text-sm font-bold text-[#1e293b] group-hover:text-[#231651] transition-colors">{v.name}</p>
                              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{v.orders} Orders overall</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-sm font-black text-[#1e293b]">{v.volume}</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">Excellent Status</p>
                      </div>
                  </div>
                ))
              )}
          </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
