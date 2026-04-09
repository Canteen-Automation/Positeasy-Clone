import { useState, useEffect } from 'react';
import { 
  Target,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Wallet
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Sales');
  const [timeRange, setTimeRange] = useState('Today');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50/50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[#0f4475] font-black uppercase tracking-widest text-sm"
        >
          Loading Business Intelligence...
        </motion.div>
      </div>
    );
  }

  const { stats, storeOverview, hourlySales, insights } = data;

  const pieData = [
    { name: 'Full Payment', value: stats.totalSales, color: '#8b5cf6' },
    { name: 'Credit', value: 0, color: '#fbbf24' } // Credits logic can be added later
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-inter">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
             <button title="Navigate back to previous section" className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                <ArrowRight className="rotate-180 text-slate-400" size={18} />
             </button>
             <h2 className="text-xs font-black text-[#0f4475] uppercase tracking-widest">Dashboard</h2>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Good morning</h1>
          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
            <span className="p-0.5 bg-slate-200 rounded text-slate-500">i</span>
            The default time settings for the merchant view are from 12:00 AM to 11:59 PM.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <select title="Filter by store type or category" className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-600 outline-none focus:border-[#0f4475] transition-all cursor-pointer shadow-sm">
                 <option>Store Type: All</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <ChevronRight size={14} className="rotate-90 text-slate-400" />
              </div>
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
                  title={`View ${tab} analysis and trends`}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[#0f4475]' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {tab}
                    {activeTab === tab && (
                       <motion.div layoutId="tabLineMain" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f4475]" />
                    )}
                 </button>
              ))}
           </div>

           <div className="flex items-center justify-end mb-4 gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full border-2 border-[#0f4475]/30 bg-[#0f4475]/10" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Revenue</span>
              </div>
           </div>

           <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlySales}>
                  <defs>
                    <linearGradient id="colorSalesMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesMain)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Total Sales Gauge */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                 <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest">Total Revenue</h3>
                 <Target size={14} className="text-slate-300" />
              </div>
           </div>

           <div className="relative h-[280px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={210}
                    endAngle={-30}
                   >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                   </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tighter">₹{stats.totalSales.toLocaleString()}</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Life Time</p>
              </div>
              <div className="flex gap-6 mt-2">
                 {pieData.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-black">{item.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Stats Column */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
           {/* Filters */}
           <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2 scrollbar-none">
              {['Yesterday', 'Today', 'Week', '30 Days'].map(range => (
                 <button 
                  key={range}
                  title={`Analyze data from ${range.toLowerCase()}`}
                  onClick={() => setTimeRange(range)}
                  className={`whitespace-nowrap px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${timeRange === range ? 'text-white bg-[#0f4475] shadow-md shadow-[#0f4475]/20' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    {range}
                 </button>
              ))}
           </div>

           {/* Total Orders Card */}
           <div title="View detailed order volume and throughput" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative h-[180px] flex flex-col justify-between group hover:border-[#0f4475]/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                    <ShoppingBag size={20} />
                 </div>
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Orders</h4>
              </div>
              <div className="flex flex-col items-center">
                 <h2 className="text-5xl font-black text-slate-800 tracking-tighter">{stats.activeOrders}</h2>
                 <div className="w-full h-1 bg-green-500 rounded-full mt-4 shadow-sm" />
              </div>
           </div>

           {/* Expenses Card */}
           <div title="Track operational expenditures and overhead" className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm h-[130px] flex flex-col justify-between group hover:border-[#0f4475]/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-50 text-[#0f4475] rounded-xl shadow-sm group-hover:bg-[#0f4475]/10 transition-colors">
                    <Wallet size={20} />
                 </div>
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Expenses</h4>
              </div>
              <div className="text-center pb-2">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tighter">₹0</h2>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-12 gap-8 mt-4 pb-12">
         {/* Store Insights */}
         <div className="col-span-12 lg:col-span-5 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 tracking-tight mb-8 uppercase tracking-widest">Business Intelligence</h3>
            <div className="space-y-4 flex-1">
               {insights.map((insight: string, idx: number) => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-transparent transition-all cursor-default"
                  >
                     <p className="text-[11px] font-black text-slate-600 leading-relaxed uppercase tracking-tight">{insight}</p>
                  </motion.div>
               ))}
            </div>
            <div className="mt-8">
               <button title="Refresh and sync comprehensive business insights" className="w-full py-3 border border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-[#0f4475]/30 hover:text-[#0f4475] transition-all">
                  Generate More Insights
               </button>
            </div>
         </div>

         {/* Store Overview */}
         <div className="col-span-12 lg:col-span-7 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase tracking-widest">Store Performance</h3>
               <button title="View detailed metrics for all geographic locations" className="text-[10px] font-black text-[#0f4475] uppercase tracking-widest hover:underline">View All Locations</button>
            </div>
            
            <div className="space-y-6">
               {(storeOverview.length > 0 ? storeOverview : [{name: 'No active sales currently', sale: 0, orders: 0, taxes: 0, purchase: 0}]).map((store: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-[28px] border border-slate-50 bg-slate-50/30 group hover:bg-white hover:shadow-lg hover:border-transparent transition-all border-l-4 border-l-[#0f4475]/30">
                     <p className="text-xs font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center justify-between">
                        {store.name}
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0f4475]" />
                     </p>
                     <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                           <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest opacity-60">Gross Sale</p>
                           <p className="text-lg font-black text-slate-800 tracking-tighter">₹{Number(store.sale).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1.5">
                           <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-60">Volume</p>
                           <p className="text-lg font-black text-slate-800 tracking-tighter">{store.orders} Orders</p>
                        </div>
                        <div className="space-y-1.5">
                           <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest opacity-60">Taxation</p>
                           <p className="text-lg font-black text-slate-800 tracking-tighter">₹{store.taxes}</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                           <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest opacity-60">Procurement</p>
                           <p className="text-lg font-black text-slate-800 tracking-tighter">₹{store.purchase}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-10 flex justify-center">
               <button title="Execute a granular comparison across different store cohorts" className="flex items-center gap-3 px-8 py-3 bg-[#0f4475] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#0f4475]/20 hover:scale-105 transition-all group">
                  Detailed Comparison
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
