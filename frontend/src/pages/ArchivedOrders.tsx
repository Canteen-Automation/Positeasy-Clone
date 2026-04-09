import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  CreditCard, 
  User,
  ShoppingBag,
  MoreVertical,
  RefreshCw,
  Archive,
  RotateCcw,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import Pagination from '../components/Pagination';

interface OrderItem {
  id?: number;
  productName: string;
  quantity: number;
  price: number;
  productId: number;
}

interface UserData {
  name: string;
  mobileNumber: string;
}

interface Order {
  id: number;
  orderNumber: string;
  displayOrderId: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user: UserData;
  items: OrderItem[];
}

const ArchivedOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  
  // Default to showing yesterday's orders in the archive view
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));

  // Pagination States
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchArchivedOrders();
  }, [startDate, endDate, statusFilter, paymentFilter, currentPage, pageSize]);

  const fetchArchivedOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('archived', 'true'); // Explicitly request archived orders
      if (startDate) params.append('startDate', `${startDate}T00:00:00`);
      if (endDate) params.append('endDate', `${endDate}T23:59:59`);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('paymentType', paymentFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage.toString());
      params.append('size', pageSize.toString());

      const response = await fetch(`http://${window.location.hostname}:8080/api/orders/all?${params.toString()}`);
      const data = await response.json();
      
      if (data && data.content && Array.isArray(data.content)) {
        setOrders(data.content);
        setTotalElements(data.totalElements);
        if (data.content.length > 0) {
          setSelectedOrder(data.content[0]);
        } else {
          setSelectedOrder(null);
        }
      } else {
        setOrders([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error fetching archived orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArchivedOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PAID': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8fafc] animate-in fade-in duration-500">
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mr-4">
             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                <Archive size={20} />
             </div>
             <div>
                <h1 className="text-lg font-black text-slate-900 leading-none">Archived Bills</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Transaction History</p>
             </div>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 gap-2 focus-within:border-slate-400 transition-all">
            <Calendar size={18} className="text-slate-400" />
            <input 
              type="date" 
              className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-300">to</span>
            <input 
              type="date" 
              className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 gap-2 min-w-[140px]">
            <Filter size={18} className="text-slate-400" />
            <select 
              className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none w-full cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 gap-3 focus-within:bg-white focus-within:border-slate-400 transition-all shadow-inner">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search history by ID, Name or Mobile..." 
              className="bg-transparent border-none text-sm w-full outline-none text-slate-700 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="bg-slate-900 hover:bg-black text-white rounded-lg px-6 py-2 text-sm font-semibold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            Search Archives
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex max-w-[1800px] mx-auto w-full p-4 gap-4">
        {/* Left Column: Archived List */}
        <div className="w-[400px] flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
              <RefreshCw className="animate-spin" size={20} />
              <span>Scanning archives...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <Archive size={48} className="mx-auto text-slate-100 mb-4" />
              <h3 className="text-slate-600 font-semibold mb-1">No archived bills recorded</h3>
              <p className="text-slate-400 text-sm">Try expanding the date range</p>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`group relative bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${
                  selectedOrder?.id === order.id 
                    ? 'border-slate-900 ring-1 ring-slate-900 shadow-md' 
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border opacity-70 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Grand Total</div>
                    <div className="text-lg font-black text-slate-900 leading-none">₹{order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-1 tracking-wider uppercase">Order #</div>
                    <div className="text-2xl font-black text-slate-800 leading-none tracking-tight">#{order.displayOrderId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-700 mb-1">
                      {order.user?.name || 'Anonymous User'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1">
                      <Clock size={10} />
                      {format(new Date(order.createdAt), 'dd MMMM yyyy')}
                    </div>
                  </div>
                </div>
                
                {selectedOrder?.id === order.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900 rounded-l-xl" />
                )}
              </div>
            ))
          )}
          
          <Pagination 
            currentPage={currentPage}
            pageSize={pageSize}
            totalElements={totalElements}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(0);
            }}
          />
        </div>

        {/* Right Column: Order Details */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden relative mb-4">
          {selectedOrder ? (
            <>
              {/* Order Detail Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-xl text-white shadow-lg shadow-slate-200">
                    <Archive size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight uppercase">
                       Archived Receipt #{selectedOrder.displayOrderId}
                    </h2>
                    <p className="text-xs text-slate-400 font-black tracking-[0.2em] uppercase">Security ID: {selectedOrder.orderNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <div className="text-right mr-3">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Issued Date</div>
                      <div className="text-xs font-bold text-slate-700">{format(new Date(selectedOrder.createdAt), 'EEEE, MMMM dd yyyy')}</div>
                   </div>
                   <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase border shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                   </div>
                </div>
              </div>

              {/* Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-8 mb-12">
                   <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                         <User size={28} />
                      </div>
                      <div>
                         <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Customer Info</div>
                         <div className="text-lg font-black text-slate-800 leading-none mb-1">{selectedOrder.user?.name || 'Walk-in Customer'}</div>
                         <div className="text-xs font-bold text-slate-400">{selectedOrder.user?.mobileNumber || 'No Contact Data'}</div>
                      </div>
                   </div>
                   <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                         <CreditCard size={28} />
                      </div>
                      <div>
                         <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Payment Method</div>
                         <div className="text-lg font-black text-slate-800 leading-none mb-1">{selectedOrder.paymentMethod.toUpperCase()}</div>
                         <div className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle size={10} /> Verified Record</div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Archived Line Items</h3>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Value</h3>
                  </div>
                  
                  <div className="divide-y divide-slate-50">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="py-5 flex justify-between items-center group hover:bg-slate-50/50 transition-colors rounded-lg -mx-2 px-2">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:bg-slate-900 group-hover:text-white transition-colors">
                             {item.productName.substring(0, 2)}
                           </div>
                           <div>
                              <div className="font-black text-slate-800 text-sm italic">{item.productName}</div>
                              <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Qty: {item.quantity} Unit(s)</div>
                           </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">@ ₹{item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Totals Summary */}
              <div className="bg-slate-900 p-8 text-white">
                <div className="flex justify-between">
                   <div className="flex gap-12">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Unique Items</div>
                        <div className="text-2xl font-black">{selectedOrder.items.length}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Record Status</div>
                        <div className="text-xs font-black px-3 py-1 bg-white/10 rounded-full border border-white/20 inline-flex items-center gap-2 uppercase">
                          <Clock size={12} /> Closed File
                        </div>
                      </div>
                   </div>
                   <div className="text-right flex flex-col gap-1 min-w-[250px]">
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Final Settlement</div>
                      <div className="text-4xl font-black text-emerald-400 leading-none mb-1">₹{selectedOrder.totalAmount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Transaction Fully Reconciled</div>
                   </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                   <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest max-w-sm">This is a permanent historical record. Modifications are disabled for archived data to maintain audit integrity.</p>
                   <button 
                    onClick={() => window.print()}
                    className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center gap-2 shadow-xl"
                   >
                     Print Copy <ShoppingBag size={14} />
                   </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Archive size={48} className="text-slate-100" />
              </div>
              <h3 className="text-slate-600 font-bold text-lg mb-2">Select a historical file</h3>
              <p className="max-w-xs mx-auto text-sm italic font-medium">Browse through your previous days' turnover by selecting an entry from the ledger on the left.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .flex-1.bg-white.border.border-slate-200.rounded-2xl, 
          .flex-1.bg-white.border.border-slate-200.rounded-2xl * {
            visibility: visible;
          }
          .flex-1.bg-white.border.border-slate-200.rounded-2xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
          button, 
          .sticky {
            display: none !important;
          }
          .bg-slate-900 {
            background-color: #f1f5f9 !important;
            color: #000 !important;
          }
          .text-emerald-400 {
             color: #059669 !important;
          }
          .text-slate-500 {
             color: #64748b !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ArchivedOrders;
