import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, TrendingUp, ChevronRight, BarChart3, Grid2X2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    categories: 0,
    users: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const [prodRes, orderRes, catRes, userRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/categories'),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const prods = await prodRes.json();
      const orders = await orderRes.json();
      const cats = await catRes.json();
      const users = await userRes.json();
      
      const revenue = orders.filter((o: any) => o.status === 'PAID').reduce((sum: number, o: any) => sum + o.total, 0);
      
      setStats({
        products: prods.length,
        orders: orders.length,
        categories: cats.length,
        users: users.length,
        revenue
      });
    } catch (err) {
      console.error(err);
    }
  };

  const cards = [
    { title: 'Statistik Barang', value: `${stats.products} Item`, sub: `${stats.categories} Kategori`, icon: Package, color: 'bg-blue-500', link: '/admin/products' },
    { title: 'Total Penjualan', value: stats.orders, sub: 'Transaksi', icon: ShoppingBag, color: 'bg-indigo-500', link: '/admin/orders' },
    { title: 'Omzet Penjualan', value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, sub: 'Lunas', icon: TrendingUp, color: 'bg-emerald-500', link: '/admin/orders' },
    { title: 'Basis Pelanggan', value: stats.users, sub: 'Akun Terdaftar', icon: Users, color: 'bg-amber-500', link: '/admin/users' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} /> Dashboard Statistik
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 ml-11">Ringkasan Inventaris & Peforma Penjualan EduStore</p>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <p className="text-[10px] font-black text-slate-400 font-mono text-right uppercase tracking-[0.3em] mb-1">Status Server</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-sm font-black italic text-slate-800 tracking-tight uppercase">Operational</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Link key={i} to={card.link} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.color} opacity-5 -translate-y-8 translate-x-8 rounded-full`} />
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-4 rounded-2xl ${card.color} text-white shadow-lg`}>
                <card.icon size={28} />
              </div>
              <div className="flex-grow">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic">{card.value}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{card.sub}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
              <span>Buka Laporan</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-6 italic border-b border-slate-100 pb-4">Aksi Cepat Manajemen</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/products" className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex flex-col items-center gap-3 group text-center">
              <Package className="text-blue-600 group-hover:scale-110 transition-transform" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-700 italic">Katalog Produk</span>
            </Link>
            <Link to="/admin/categories" className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all flex flex-col items-center gap-3 group text-center">
              <Grid2X2 className="text-purple-600 group-hover:scale-110 transition-transform" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-700 italic">Kelola Kategori</span>
            </Link>
            <Link to="/admin/users" className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all flex flex-col items-center gap-3 group text-center">
              <Users className="text-amber-600 group-hover:scale-110 transition-transform" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-700 italic">Data Pengelana</span>
            </Link>
            <Link to="/admin/orders" className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex flex-col items-center gap-3 group text-center">
              <ShoppingBag className="text-indigo-600 group-hover:scale-110 transition-transform" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-700 italic">Tracking Pesanan</span>
            </Link>
          </div>
        </div>


        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 blur-[100px] opacity-20" />
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 italic border-b border-white/10 pb-4 relative z-10">Pemberitahuan Sistem</h2>
          <div className="space-y-4 relative z-10">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex gap-4">
              <div className="w-2 h-2 mt-2 bg-blue-400 rounded-full animate-pulse" />
              <p className="text-sm text-white/70 font-medium">Jangan Lupa Selalu Periksa Transaksi Yang Masuk.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex gap-4">
              <div className="w-2 h-2 mt-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-sm text-white/70 font-medium">Say Hamdallah Everytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
