import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Filter, Loader2, Download, Printer, X } from 'lucide-react';
import { format } from 'date-fns';

interface PurchaseOrder {
  id: number;
  purchaseId: string;
  date: string;
  vendor: { id: number; name: string };
  amount: number;
  paidTotal: number;
  status: string;
  referenceId: string;
}

const Bills: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/purchases/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      setIsSaving(true);
      const updatedPaidTotal = Number(selectedOrder.paidTotal) + Number(paymentAmount);
      
      const response = await fetch('/api/purchases/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedOrder,
          paidTotal: updatedPaidTotal,
          status: updatedPaidTotal >= selectedOrder.amount ? 'CLOSE' : 'PARTIALLY PAID'
        }),
      });

      if (response.ok) {
        await fetchOrders();
        setShowPayModal(false);
        setSelectedOrder(null);
        setPaymentAmount(0);
      }
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.purchaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.referenceId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BILLED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CLOSE':
      case 'CLOSED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'OPEN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PARTIALLY PAID':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header Section */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Purchase Bills</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track your vendor payments and payables</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              title="Download bill report"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={18} />
              Export
            </button>
            <button 
              title="Print all bills"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
            >
              <Printer size={18} />
              Print Batch
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID or Reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              title="Search through bills"
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                title="Filter by payment status"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Status</option>
                <option value="BILLED">Billed</option>
                <option value="CLOSE">Closed</option>
                <option value="OPEN">Open</option>
                <option value="PARTIALLY PAID">Partially Paid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Purchase ID</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider text-right">Order Amount (₹)</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider text-right">Paid Total (₹)</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider text-right">Payables (₹)</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Reference ID</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-indigo-500" />
                      <span>Loading bills...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No matching bills found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const payables = Number(order.amount) - Number(order.paidTotal);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{order.purchaseId}</span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-600">
                        {order.date ? format(new Date(order.date), 'dd-MMM-yyyy hh:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(order.status)} uppercase`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-900 text-right">
                        {Number(order.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-600 text-right">
                        {Number(order.paidTotal).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-[13px] font-bold text-right ${payables > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {payables.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500">
                        {order.referenceId || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setPaymentAmount(payables);
                            setShowPayModal(true);
                          }}
                          title="Record Payment"
                          className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
                <button 
                  onClick={() => setShowPayModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Order #{selectedOrder.purchaseId}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Order Total</p>
                  <p className="text-lg font-bold text-slate-900">₹{Number(selectedOrder.amount).toFixed(2)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Remaining</p>
                  <p className="text-lg font-bold text-red-600">₹{(selectedOrder.amount - selectedOrder.paidTotal).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Payment Amount (₹)</label>
                <input 
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl text-lg font-bold outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 flex items-center gap-3">
              <button 
                onClick={() => setShowPayModal(false)}
                className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRecordPayment}
                disabled={isSaving || paymentAmount <= 0}
                className="flex-[2] px-8 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Pagination */}
      <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
        <div>
          Showing {filteredOrders.length} of {orders.length} bills
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-slate-100 rounded">
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <span className="px-3">1 of 1</span>
            <button className="p-2 hover:bg-slate-100 rounded">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills;
