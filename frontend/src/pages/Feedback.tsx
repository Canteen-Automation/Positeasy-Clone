import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight,
  RefreshCw,
  PieChart as PieChartIcon,
  ThumbsUp,
  X,
  Clock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../components/Pagination';

interface RatedItem {
  name: string;
  average: number;
  count: number;
}

interface ItemDetail {
  rating: number;
  comment: string;
  date: string;
}

interface FeedbackStats {
  averageRating: number;
  distribution: Array<{
    rating: number;
    count: number;
  }>;
  ratedItems: RatedItem[];
}

const Feedback: React.FC = () => {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Feedbacks list states
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Modal states
  const [selectedItem, setSelectedItem] = useState<RatedItem | null>(null);
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
  const [detailsLoading, setItemDetailsLoading] = useState(false);
  const [detailsPage, setDetailsPage] = useState(0);
  const [detailsTotal, setDetailsTotal] = useState(0);
  const detailsPageSize = 5;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:8080/api/feedback/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:8080/api/feedback?page=${page}&size=${pageSize}`);
      const data = await response.json();
      setFeedbacks(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    }
  };

  const fetchItemDetails = async (itemName: string, pageNum: number) => {
    setItemDetailsLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:8080/api/feedback/item-details?productName=${encodeURIComponent(itemName)}&page=${pageNum}&size=${detailsPageSize}`);
      const data = await response.json();
      setItemDetails(data?.content || []);
      setDetailsTotal(data?.totalElements || 0);
    } catch (error) {
      console.error('Error fetching item details:', error);
      setItemDetails([]);
    } finally {
      setItemDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [page]);

  useEffect(() => {
    if (selectedItem) {
      fetchItemDetails(selectedItem.name, detailsPage);
    }
  }, [selectedItem, detailsPage]);

  const COLORS = ['#ef4444', '#f59e0b', '#facc15', '#84cc16', '#22c55e'];
  
  const pieData = (stats?.distribution || []).map(d => ({
    name: `${d.rating} Stars`,
    value: d.count
  })).sort((a, b) => a.name.localeCompare(b.name));

  const renderStars = (rating: number, size = 12) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={size} 
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} 
          />
        ))}
      </div>
    );
  };

  const handleItemClick = (item: RatedItem) => {
    setSelectedItem(item);
    setDetailsPage(0);
    setItemDetails([]);
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Food Quality Feedback</h1>
          <p className="text-slate-500 mt-1">Item-wise performance monitoring and anonymous reviews</p>
        </div>
        
        <button 
          onClick={() => fetchStats()}
          className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sync Data
        </button>
      </div>

      {!stats ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <RefreshCw size={48} className="text-indigo-200 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Aggregating quality data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl">
                <Star size={32} fill="currentColor" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global Average</p>
                <h2 className="text-4xl font-black text-slate-900">{stats.averageRating.toFixed(1)} <span className="text-lg text-slate-300">/ 5.0</span></h2>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl">
                <MessageSquare size={32} fill="currentColor" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Rated Products</p>
                <h2 className="text-4xl font-black text-slate-900">{stats?.ratedItems?.length || 0}</h2>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl">
                <ThumbsUp size={32} fill="currentColor" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Highest Rated</p>
                <h2 className="text-xl font-black text-slate-900 truncate max-w-[200px]">{stats?.ratedItems?.[0]?.name || 'N/A'}</h2>
                <p className="text-[10px] text-emerald-600 font-bold">{stats?.ratedItems?.[0]?.average?.toFixed(1) || '0.0'} avg rating</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rating Distribution Chart */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
                  <PieChartIcon size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Rating Distribution</h3>
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quality Trend / Top items chart */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Top Performing Foods</h3>
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(stats?.ratedItems || []).slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 5]} hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={120}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="average" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Food Items List */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
               <h3 className="text-lg font-bold text-slate-900">Product Performance Log</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Food Item</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Average Rating</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Total Reviews</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(stats?.ratedItems || []).map((item, index) => (
                    <tr 
                      key={index} 
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-700">{item.name}</div>
                        <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Primary Menu</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900">{item.average.toFixed(1)}</span>
                          {renderStars(Math.round(item.average))}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                          {item.count} Feedbacks
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button className="p-2 text-slate-300 group-hover:text-indigo-600 transition-colors">
                            <ChevronRight size={20} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 bg-indigo-600 text-white flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedItem.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
                       <Star size={14} fill="currentColor" /> {selectedItem.average.toFixed(1)}
                    </div>
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{selectedItem.count} TOTAL REVIEWS</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                <div className="space-y-4">
                  {detailsLoading && itemDetails.length === 0 ? (
                    <div className="py-20 text-center">
                       <RefreshCw size={32} className="animate-spin mx-auto text-indigo-200 mb-4" />
                       <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Loading reviews...</p>
                    </div>
                  ) : itemDetails.map((detail, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                               <Clock size={16} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{format(new Date(detail.date), 'dd MMM yyyy, hh:mm a')}</span>
                         </div>
                         {renderStars(detail.rating, 16)}
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium italic">
                        "{detail.comment || 'No written review provided'}"
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                         <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-500">A</div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Anonymous Customer</span>
                      </div>
                    </div>
                  ))}

                  {!detailsLoading && itemDetails.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-bold">
                       No detailed reviews found.
                    </div>
                  )}
                </div>
              </div>

              {detailsTotal > detailsPageSize && (
                <div className="p-6 bg-white border-t border-slate-100">
                   <Pagination 
                     currentPage={detailsPage}
                     pageSize={detailsPageSize}
                     totalElements={detailsTotal}
                     onPageChange={setDetailsPage}
                   />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feedback;
