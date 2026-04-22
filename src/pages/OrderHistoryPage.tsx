import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/orders/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error('Gagal memuat riwayat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Memuat riwayat...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-8 items-center gap-2 flex">
        <ShoppingBag className="text-blue-500" size={24} /> 
        Riwayat Pesanan Saya
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Belum ada pesanan</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Anda belum melakukan transaksi apapun di EduStore.</p>
          <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 inline-block">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">ORDER ID: {order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm font-bold text-slate-800 italic">
                    Diterbitkan pada {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                </div>
                <div className={`self-start px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                  order.status === 'PAID' ? 'bg-blue-600 text-white shadow-sm shadow-blue-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {order.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {order.status}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 text-xs font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <span className="flex-grow uppercase tracking-tight truncate">{item.product.name}</span>
                    <span className="text-slate-400 font-mono italic">{item.quantity} Unit</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Total Transaksi</p>
                  <p className="text-xl font-bold text-slate-900 tracking-tighter">Rp {order.total.toLocaleString('id-ID')}</p>
                </div>
                <Link 
                  to={`/invoice/${order.id}`} 
                  className="px-6 py-2.5 bg-slate-50 text-slate-800 rounded-lg font-bold uppercase tracking-widest text-[10px] border border-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all flex items-center gap-2 italic"
                >
                  Lihat Invoice <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
