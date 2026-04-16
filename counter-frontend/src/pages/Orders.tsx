import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  RefreshCw, 
  ShoppingBag, 
  CreditCard, 
  User,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ORDERS = [
  { id: 13, displayId: '#13', date: '2026-04-08', amount: 320, status: 'PAID', items: 3 },
  { id: 12, displayId: '#12', date: '2026-04-08', amount: 1000, status: 'PAID', items: 1 },
  { id: 11, displayId: '#11', date: '2026-04-08', amount: 60, status: 'PAID', items: 2 },
  { id: 10, displayId: '#10', date: '2026-04-08', amount: 50, status: 'PAID', items: 1 },
  { id: 9, displayId: '#9', date: '2026-04-08', amount: 50, status: 'PAID', items: 1 },
  { id: 8, displayId: '#8', date: '2026-04-08', amount: 20, status: 'PAID', items: 1 },
];

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const host = window.location.hostname;
      const paymentType = activeTab === 'ALL' ? '' : activeTab;
      
      let url = `http://${host}:8080/api/orders/all?archived=false&paymentType=${paymentType}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      const orderList = Array.isArray(data) ? data : (data.content || []);
      setOrders(orderList);
      
      if (orderList.length > 0 && !selectedOrder) {
        setSelectedOrder(orderList[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, [activeTab, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Sub Header / Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex gap-10">
          {['ALL', 'CASH', 'UPI', 'CARD'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedOrder(null);
              }}
              className={`py-6 text-xs font-black uppercase tracking-[0.2em] relative transition-all flex items-center gap-2 ${
                activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === tab && <motion.div layoutId="activeOrderTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Order List */}
        <div className="w-[400px] bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Feed</h2>
             <button onClick={fetchOrders} className="text-primary hover:rotate-180 transition-all duration-500">
                <RefreshCw size={16} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                 <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${
                    selectedOrder?.id === order.id
                      ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5 scale-[1.02]'
                      : 'bg-white border-slate-100/50 hover:border-primary/20 hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg">#{order.displayOrderId || order.id}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(order.createdAt).toLocaleTimeString()}</p>
                     </div>
                     <span className="text-xl font-black text-slate-900 tracking-tighter">₹{order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {order.status}
                     </span>
                     <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronRight size={16} />
                     </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                 <ShoppingBag size={48} />
                 <p className="font-black uppercase tracking-widest text-[10px]">No orders found in {activeTab}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Order Detail */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white">
          {selectedOrder ? (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="max-w-4xl mx-auto"
            >
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary border border-primary/10">
                       <ShoppingBag size={40} />
                    </div>
                    <div>
                        <div className="flex items-center gap-4">
                           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Order #{selectedOrder.displayOrderId || selectedOrder.id}</h1>
                           <span className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 shadow-sm">{selectedOrder.status}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-60">Reference ID: {selectedOrder.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Created At</p>
                     <p className="text-sm font-black text-slate-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50 space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Type</p>
                     <p className="text-md font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                        <CreditCard size={20} className="text-primary" /> {selectedOrder.paymentMethod}
                     </p>
                  </div>
                  <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50 space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</p>
                     <p className="text-md font-black text-slate-800 flex items-center gap-3">
                        <User size={20} className="text-primary" /> {selectedOrder.user?.name || 'Walk-in Customer'}
                     </p>
                  </div>
                  <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50 space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Type</p>
                     <p className="text-md font-black text-slate-800 flex items-center gap-3 uppercase tracking-widest">
                        {selectedOrder.orderType.replace('_', ' ')}
                     </p>
                  </div>
               </div>

               <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Item List</h3>
                     <span className="text-xs font-bold text-slate-400 leading-none">{selectedOrder.items?.length || 0} ITEMS</span>
                  </div>
                  <div className="space-y-4">
                     {selectedOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-sm group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                 {item.productName?.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                 <h4 className="font-black text-slate-800 uppercase tracking-tight text-md">{item.productName}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.stallName}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xl font-black text-slate-900 tracking-tighter">₹{item.price * item.quantity}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{item.quantity}x @ ₹{item.price}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-end pt-8 border-t border-slate-100">
                  <div className="bg-primary p-1 rounded-[3rem] shadow-2xl shadow-primary/30 min-w-[400px]">
                     <div className="bg-white p-10 rounded-[2.8rem] space-y-6">
                        <div className="flex justify-between items-center opacity-40">
                           <span className="text-xs font-black uppercase tracking-widest">Subtotal</span>
                           <span className="text-sm font-black tracking-tight">₹{selectedOrder.totalAmount}</span>
                        </div>
                        <div className="h-[1px] bg-slate-100" />
                        <div className="flex justify-between items-center">
                           <span className="text-lg font-black text-slate-900 tracking-tight uppercase">Order Total</span>
                           <span className="text-4xl font-black text-primary tracking-tighter">₹{selectedOrder.totalAmount}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 gap-6 opacity-40">
               <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                  <ShoppingBag size={48} />
               </div>
               <p className="font-black uppercase tracking-[0.3em] text-[10px]">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      ` }} />
    </div>
  );
};

export default Orders;
