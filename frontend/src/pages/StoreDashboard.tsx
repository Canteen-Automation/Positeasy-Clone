import { useState, useEffect } from 'react';
import { 
  ChevronRight,
  ShoppingBag,
  Wallet,
  ArrowRight,
  RotateCcw,
  Star
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const salesData = [
  { time: '12am', value: 0 },
  { time: '2am', value: 0 },
  { time: '4am', value: 0 },
  { time: '6am', value: 0 },
  { time: '8am', value: 5000 },
  { time: '10am', value: 16000 },
  { time: '12pm', value: 6000 },
];

const trendingItems = [
  { name: "GHEE ROAST", category: "BREAK FAST", qty: 64, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&q=80" },
  { name: "KAL DOSA (2pcs)", category: "BREAK FAST", qty: 60, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80" },
  { name: "VEG S.W", category: "SNACKS", qty: 51, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80" },
  { name: "PLAIN DOSA", category: "BREAK FAST", qty: 51, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=200&q=80" }
];

const StoreDashboard = () => {
  const [activeTab, setActiveTab] = useState('Sales');
  const [timeRange, setTimeRange] = useState('Today');
  const [stats, setStats] = useState({
    totalSales: 48438,
    activeOrders: 912,
    dailyCustomers: 813,
    revenueGrowth: 12.5
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          // Find RIT Canteen in storeOverview if available, otherwise use general stats
          if (data.storeOverview && data.storeOverview.length > 0) {
             const ritStore = data.storeOverview.find((s: any) => s.name === 'RIT Canteen');
             if (ritStore) {
                setStats({
                   totalSales: ritStore.sale,
                   activeOrders: ritStore.orders,
                   dailyCustomers: ritStore.orders * 0.9, // Approximation
                   revenueGrowth: 12.5
                });
             } else {
                setStats(data.stats);
             }
          } else {
             setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const pieData = [
    { name: 'Full Payment', value: stats.totalSales, color: '#8b5cf6' },
    { name: 'Credit', value: 0, color: '#fbbf24' }
  ];

  const insights = [
    { text: `${stats.activeOrders} orders at RIT Canteen! Clearly the crowd's found their happy place 💃🕺`, color: "bg-rose-50 text-rose-600 border-rose-100" },
    { text: `₹${(stats.totalSales / (stats.activeOrders || 1)).toFixed(2)} average order value at RIT Canteen! Either everyone's hungry or just living large 🔥😋`, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { text: `RIT Canteen had ${stats.activeOrders} orders but only ${Math.round(stats.dailyCustomers)} customers — Maybe customers are shy and didn't give their names 🥰`, color: "bg-orange-50 text-orange-600 border-orange-100" },
    { text: `RIT Canteen clocked ₹${stats.totalSales.toLocaleString()} — ka-ching! That's called business booming 💸📈`, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { text: "RIT Canteen reaches its morning sales peak around 9AM — breakfast rush in full swing 🍳🥞", color: "bg-indigo-50 text-indigo-600 border-indigo-100" }
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-inter">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
             <button title="Return to previous screen" className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                <ArrowRight className="rotate-180 text-slate-400" size={18} />
             </button>
             <h2 className="text-xs font-black text-[#521c4b] uppercase tracking-widest">Store Dashboard</h2>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Good morning, RIT Canteen</h1>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2">
              <div className="relative group">
                 <select title="Switch established store location" className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-600 outline-none focus:border-[#521c4b] transition-all cursor-pointer shadow-sm">
                    <option>RIT Canteen</option>
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight size={14} className="rotate-90 text-slate-400" />
                 </div>
              </div>
              <div className="relative group">
                 <select title="Toggle between available display views" className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-600 outline-none focus:border-[#521c4b] transition-all cursor-pointer shadow-sm">
                    <option>All</option>
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight size={14} className="rotate-90 text-slate-400" />
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button title="Synchronize latest live data from backend" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                 <RotateCcw size={18} />
              </button>
              <button title="Mark this store dashboard as favorite for quick access" className="p-2 bg-white border border-slate-200 rounded-xl text-amber-500 hover:scale-110 transition-all shadow-sm">
                 <Star size={18} fill="#f59e0b" />
              </button>
           </div>
           <div title="Authenticated User: Abiram" className="w-8 h-8 rounded-full bg-[#521c4b] text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer hover:ring-2 ring-[#521c4b]/20 transition-all">
              A
           </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sales Chart Section */}
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="flex items-center gap-8 mb-8 border-b border-slate-50">
              {['Sales', 'Payments'].map(tab => (
                 <button 
                  key={tab}
                  title={`Visualize ${tab.toLowerCase()} throughput data`}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#521c4b]' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {tab}
                    {activeTab === tab && (
                       <motion.div layoutId="tabLineStore" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#521c4b]" />
                    )}
                 </button>
              ))}
           </div>

           <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSalesStore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesStore)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Total Sales Gauge */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative">
           <div className="relative h-[280px] flex flex-col items-center justify-center mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={210}
                    endAngle={-150}
                   >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                   </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tighter">₹{stats.totalSales.toLocaleString()}</h2>
              </div>
              <div className="flex gap-6 mt-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full-Payment</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Stats Column */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
           {/* Filters */}
           <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2 scrollbar-none">
              {['Yesterday', 'Today', 'Week', '30 Days', 'Custom'].map(range => (
                 <button 
                  key={range}
                  title={`Filter metrics by ${range.toLowerCase()}`}
                  onClick={() => setTimeRange(range)}
                  className={`whitespace-nowrap px-2 py-2 text-[10px] font-black uppercase tracking-tighter transition-all relative ${timeRange === range ? 'text-[#521c4b]' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {range}
                    {timeRange === range && (
                       <motion.div layoutId="rangeLineStore" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#521c4b]" />
                    )}
                 </button>
              ))}
           </div>

           {/* Total Orders Card */}
           <div title="View detailed store volume and throughput" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative h-[180px] flex flex-col justify-between group cursor-pointer hover:border-[#521c4b]/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                    <ShoppingBag size={20} />
                 </div>
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Sales</h4>
              </div>
              <div className="flex flex-col items-center">
                 <h2 className="text-5xl font-black text-slate-800 tracking-tighter">{stats.activeOrders}</h2>
                 <div className="w-full h-1 bg-green-500 rounded-full mt-4 shadow-sm" />
              </div>
           </div>

           {/* Expenses Card */}
           <div title="Monitor store operational expenditures" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm h-[150px] flex flex-col justify-between group cursor-pointer hover:border-[#521c4b]/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-100 text-[#521c4b] rounded-xl shadow-sm">
                    <Wallet size={20} />
                 </div>
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Expenses</h4>
              </div>
              <div className="text-center">
                 <h2 className="text-4xl font-black text-slate-800 tracking-tighter">₹0</h2>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-12 gap-8 mt-4 pb-12">
         {/* Trending Items */}
         <div className="col-span-12 lg:col-span-6 bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest">Trending Items</h3>
                  <div className="p-1 px-2 bg-indigo-50 rounded-lg text-indigo-400">
                     <Star size={12} fill="currentColor" />
                  </div>
               </div>
               <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100">
                  <button title="View inventory metrics" className="p-1.5 text-slate-400 hover:text-slate-600 transition-all"><ShoppingBag size={14} /></button>
                  <button title="View price distributions" className="text-[10px] font-black text-slate-400 px-1">₹</button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-50">
                       <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                       <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Sold Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {trendingItems.map((item, idx) => (
                       <tr key={idx} className="group cursor-pointer hover:bg-slate-50/50 transition-all">
                          <td className="py-4">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-50 group-hover:scale-105 transition-transform">
                                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-[9px] font-black text-[#521c4b] uppercase tracking-widest brightness-110">{item.category}</p>
                                   <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-4 text-right">
                             <span className="text-sm font-black text-slate-800">{item.qty}</span>
                          </td>
                       </tr>
                    ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Store Insights */}
         <div className="col-span-12 lg:col-span-6 bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 tracking-tight mb-8 uppercase tracking-widest">Store Insights</h3>
            
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[480px] custom-scrollbar pr-2">
               {insights.map((insight, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all hover:translate-x-1 ${insight.color} flex items-center gap-3`}>
                     <div className="w-6 h-6 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Star size={12} className="opacity-70" />
                     </div>
                     <p className="text-[11px] font-bold leading-relaxed">{insight.text}</p>
                  </div>
               ))}
            </div>

            <div className="mt-8 flex justify-end">
               <button title="Analyze subsequent business cycles" className="flex items-center gap-2 px-6 py-2.5 bg-[#521c4b]/5 hover:bg-[#521c4b]/10 text-[#521c4b] text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all group">
                  Next
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
