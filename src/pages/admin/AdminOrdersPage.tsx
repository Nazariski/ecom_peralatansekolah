import { useState, useEffect } from 'react';
import { ShoppingBag, Search, ExternalLink, Filter, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter 
    ? orders.filter((o: any) => o.status === filter) 
    : orders;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-2">
            <ShoppingBag size={24} className="text-blue-600" /> Semua Pesanan
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daftar Lengkap Transaksi Masuk</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase tracking-widest text-[10px] appearance-none cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="PAID">LUNAS</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-bold">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200">
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Order ID</th>
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Pelanggan</th>
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Tanggal</th>
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Total</th>
                <th className="px-6 py-4 text-center uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 text-right uppercase tracking-widest text-[10px]">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">Memuat data pesanan...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic font-mono underline decoration-slate-100">Belum ada pesanan masuk.</td>
                </tr>
              ) : filteredOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400 uppercase group-hover:text-slate-800 transition-colors">#{o.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800 uppercase tracking-tight">{o.customer_name || o.user?.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal italic">{o.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic text-[11px]">
                    {new Date(o.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-black italic">Rp {o.total.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      o.status === 'PAID' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {o.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href={`/invoice/${o.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      title="Buka Invoice"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
