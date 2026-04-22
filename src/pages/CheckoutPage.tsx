import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, CreditCard, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    address: '',
    phone: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    // Prefill user data if logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) setForm(prev => ({ ...prev, customer_name: user.name }));
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data?.items?.length) navigate('/cart');
      setCart(data);
    } catch (err) {
      navigate('/cart');
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    try {
      // 1. Create Order
      const orderRes = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const order = await orderRes.json();

      if (!orderRes.ok) throw new Error(order.message);

      // 2. Simulate Payment (Updating status to PAID)
      toast.loading('Memproses pembayaran...', { id: 'payment' });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fake latency

      const payRes = await fetch(`/api/orders/${order.id}/pay`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (payRes.ok) {
        toast.success('Pembayaran Berhasil!', { id: 'payment' });
        navigate(`/invoice/${order.id}`);
      } else {
        toast.error('Gagal memperbarui status pembayaran', { id: 'payment' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan', { id: 'payment' });
    } finally {
      setLoading(false);
    }
  };

  const total = cart?.items?.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">1</div>
            <span className="text-sm">Keranjang</span>
          </div>
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">2</div>
            <span className="text-sm">Checkout</span>
          </div>
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs border border-slate-200">3</div>
            <span className="text-sm">Invoice</span>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono italic font-medium uppercase tracking-widest hidden md:block">
          EDU/CHECK/{new Date().getFullYear()}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
              <MapPin size={20} className="text-blue-500" />
              Informasi Pengiriman
            </h2>
            
            <form id="checkout-form" onSubmit={handlePay} className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Penerima</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    required 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="tel" 
                    required 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Lengkap</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Jl. Pendidikan Raya No. 42, Kebayoran Baru, Jakarta"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </form>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Metode Pembayaran</h2>
            <div className="border-2 border-blue-100 bg-blue-50/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Dummy Payment (Simulasi)</p>
                  <p className="text-xs text-slate-500">Sistem akan otomatis mengubah status menjadi PAID</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-blue-600"></div>
            </div>
          </section>

          <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-xl border border-slate-200">
            <ShieldCheck className="text-slate-400" size={20} />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Transaksi aman & terenkripsi oleh EduStore Security Protocol v2.4
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <section className="bg-slate-800 text-white rounded-xl shadow-xl overflow-hidden border border-slate-700 h-fit">
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-lg font-bold uppercase tracking-tight">Ringkasan Pesanan</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar bg-slate-800">
              {cart?.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden">
                    <img src={item.product.image} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate uppercase tracking-tight">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      {item.quantity}x @ Rp {item.product.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="text-sm font-bold tracking-tight">Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-700 bg-slate-900/50 space-y-2">
              <div className="flex justify-between text-sm text-slate-400 font-medium italic">
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400 font-medium italic">
                <span>Biaya Pengiriman</span>
                <span className="text-blue-400 font-bold">Gratis</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 text-white uppercase tracking-tighter">
                <span>Total Pembayaran</span>
                <span className="text-blue-400 underline decoration-blue-500 decoration-2 underline-offset-8">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </section>
          
          <button 
            form="checkout-form"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all uppercase tracking-widest italic flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              'BAYAR SEKARANG (DUMMY)'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
