import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Silakan login untuk melihat keranjang');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(data);
    } catch (err) {
      toast.error('Gagal memuat keranjang');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/cart/remove/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Item dihapus');
        fetchCart();
      }
    } catch (err) {
      toast.error('Gagal menghapus item');
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/cart/update/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (res.ok) {
        fetchCart();
      } else {
        toast.error('Gagal memperbarui jumlah');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    }
  };

  if (loading) return <div className="text-center py-20">Memuat keranjang...</div>;

  const total = cart?.items?.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">1</div>
            <span className="text-sm">Keranjang</span>
          </div>
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">2</div>
            <span className="text-sm">Checkout</span>
          </div>
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs border border-slate-200">3</div>
            <span className="text-sm">Invoice</span>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono italic font-medium uppercase tracking-widest hidden md:block">
          EDU/SHOP/{new Date().getFullYear()}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-8 items-center gap-2 hidden md:flex">
        <ShoppingBag className="text-blue-500" size={24} /> 
        Detail Keranjang Belanja
      </h1>

      {!cart?.items?.length ? (
        <div className="text-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Keranjang anda masih kosong</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Mulailah petualangan belajar dengan perlengkapan sekolah berkualitas.</p>
          <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 inline-block">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {cart.items.map((item: any) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-6 items-center group">
                <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
                    {item.product.category?.name || 'Sekolah'}
                  </span>
                  <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{item.product.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <p className="text-slate-900 font-bold tracking-tight text-sm">Rp {item.product.price.toLocaleString('id-ID')}</p>
                    <span className="text-slate-200 hidden sm:block">|</span>
                    
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-8">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 hover:bg-slate-200 transition-colors font-bold text-slate-500 disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <div className="px-3 font-mono font-bold text-slate-800 border-x border-slate-200 min-w-[40px] text-center text-xs">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 hover:bg-slate-200 transition-colors font-bold text-slate-500 disabled:opacity-30"
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="col-span-12 lg:col-span-4 h-fit sticky top-24 space-y-6">
            <section className="bg-slate-800 text-white rounded-xl shadow-xl overflow-hidden border border-slate-700">
              <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-lg font-bold uppercase tracking-tight">Ringkasan Pesanan</h2>
              </div>
              <div className="p-6 space-y-4 bg-slate-800">
                <div className="flex justify-between text-sm text-slate-400 font-medium italic">
                  <span>Subtotal Barang</span>
                  <span className="font-mono text-white">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400 font-medium italic">
                  <span>Estimasi Pengiriman</span>
                  <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Gratis</span>
                </div>
                <div className="border-t border-slate-700 pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total yang harus dibayar</p>
                    <p className="text-2xl font-black tracking-tighter text-white uppercase italic">
                      Rp {total.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            <Link 
              to="/checkout" 
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] uppercase tracking-widest italic"
            >
              Lanjut ke Checkout <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
