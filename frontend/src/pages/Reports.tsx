import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  Filter,
  RefreshCw,
  Package,
  PieChart as PieChartIcon,
  IndianRupee,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, startOfToday, endOfToday, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  totalSales: number;
  totalOrders: number;
  totalPurchases: number;
  topVendor: string;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  vendorSummary: Array<{
    name: string;
    amount: number;
    orderCount: number;
  }>;
  storeOverview: Array<{
    name: string;
    sale: number;
    orders: number;
  }>;
}

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fromStr = dateRange.from.toISOString();
      const toStr = dateRange.to.toISOString();
      const response = await apiFetch(`http://${window.location.hostname}:8080/api/reports/monthly?from=${fromStr}&to=${toStr}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const downloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const title = `Sales Report (${format(dateRange.from, 'dd MMM')} - ${format(dateRange.to, 'dd MMM yyyy')})`;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('RIT CANTEEN BUSINESS REPORT', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(title, 105, 25, { align: 'center' });

    // Summary Section
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 30, 190, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Financial Summary', 20, 40);
    
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Sales Revenue', `₹ ${data.totalSales.toLocaleString()}`],
      ['Total Orders Fulfilled', data.totalOrders.toString()],
      ['Total Inventory Purchases', `₹ ${data.totalPurchases.toLocaleString()}`],
      ['Net Performance', `₹ ${(data.totalSales - data.totalPurchases).toLocaleString()}`],
      ['Top Performing Vendor', data.topVendor]
    ];

    autoTable(doc, {
      startY: 45,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Top Selling Items
    const finalY1 = (doc as any).lastAutoTable.finalY;
    doc.text('Top Selling Items', 20, finalY1 + 15);
    autoTable(doc, {
      startY: finalY1 + 20,
      head: [['Product Name', 'Quantity Sold', 'Revenue']],
      body: data.topSellingItems.map(item => [item.name, item.quantity, `₹ ${item.revenue.toLocaleString()}`]),
      theme: 'grid'
    });

    // Vendor Summary
    const finalY2 = (doc as any).lastAutoTable.finalY;
    doc.text('Vendor Performance', 20, finalY2 + 15);
    autoTable(doc, {
      startY: finalY2 + 20,
      head: [['Vendor Name', 'Total Orders', 'Spend Amount']],
      body: data.vendorSummary.map(v => [v.name, v.orderCount, `₹ ${v.amount.toLocaleString()}`]),
      theme: 'striped'
    });

    doc.save(`Report_${format(dateRange.from, 'yyyyMMdd')}_${format(dateRange.to, 'yyyyMMdd')}.pdf`);
  };

  const COLORS_CHART = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Intelligence</h1>
          <p className="text-slate-500 mt-1">Robust insights and performance analytics</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <button 
              onClick={() => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                format(dateRange.from, 'MM-yyyy') === format(new Date(), 'MM-yyyy') 
                ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              This Month
            </button>
            <button 
              onClick={() => setDateRange({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) })}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                format(dateRange.from, 'MM-yyyy') === format(subMonths(new Date(), 1), 'MM-yyyy') 
                ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Last Month
            </button>
          </div>

          <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {!data ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <RefreshCw size={48} className="text-indigo-200 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Aggregating business intelligence...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <IndianRupee size={24} />
                </div>
                <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <ArrowUpRight size={14} /> 12.5%
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Sales</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">₹{data.totalSales.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">For the selected period</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <ShoppingBag size={24} />
                </div>
                <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <ArrowUpRight size={14} /> 8.2%
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Orders</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">{data.totalOrders}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">{Math.round(data.totalOrders/30)} orders avg/day</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <Package size={24} />
                </div>
                <span className="flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-1 rounded-lg text-xs font-bold">
                  <ArrowDownRight size={14} /> 2.1%
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Spendings</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">₹{data.totalPurchases.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Inventory & Vendor bills</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Users size={24} />
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Top Vendor</h3>
              <p className="text-xl font-black text-slate-900 mt-2 truncate">{data.topVendor}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium truncate">Primary supplier this month</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Selling Products Chart */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Highly Sold Items</h3>
              </div>
              
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topSellingItems} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={120}
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={32}>
                      {data.topSellingItems.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vendor Contribution Pie Chart */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <PieChartIcon size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Vendor Expenditure Share</h3>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.vendorSummary}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="name"
                      >
                        {data.vendorSummary.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_CHART[index % COLORS_CHART.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mt-4">
                  {data.vendorSummary.slice(0, 4).map((vendor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS_CHART[index % COLORS_CHART.length] }} />
                      <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{vendor.name}</span>
                      <span className="text-xs text-slate-400 font-medium">₹{vendor.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Performance Table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Store-wise Performance</h3>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Stall / Store Name</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Orders Fulfilled</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Revenue Generated</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.storeOverview.map((store, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-700">{store.name}</div>
                        <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Primary Location</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-slate-600 font-semibold">{store.orders} Orders</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-indigo-600 font-black">₹{store.sale.toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-slate-500 font-medium">₹{store.orders > 0 ? (store.sale / store.orders).toFixed(0) : 0}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
