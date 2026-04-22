import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        toast.error('Produk tidak ditemukan');
        navigate('/');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id, quantity })
      });
      if (res.ok) {
        toast.success(`Berhasil menambahkan ${quantity} item ke keranjang`);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal menambahkan ke keranjang');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi');
    }
  };

  if (loading) return <div className="text-center py-20">Memuat detail produk...</div>;
  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-medium mb-8 transition-colors group text-sm">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-12 gap-12 items-start">
        <div className="col-span-12 lg:col-span-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] block italic">
              Kategori: {product.category?.name || 'School Equipment'}
            </span>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-900 tracking-tighter">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 italic">/ Pcs</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Jumlah Pesanan</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-sm h-11">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 hover:bg-slate-200 transition-colors font-bold text-slate-500"
                  >
                    -
                  </button>
                  <div className="px-5 font-mono font-bold text-slate-800 border-x border-slate-200 min-w-[50px] text-center">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 hover:bg-slate-200 transition-colors font-bold text-slate-500"
                  >
                    +
                  </button>
                </div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic border-l border-slate-200 pl-4 h-8 flex items-center">
                  Stok Tersedia: {product.stock}
                </div>
              </div>
            </div>

            <button 
              onClick={addToCart}
              disabled={product.stock === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.2em] text-xs italic"
            >
              <ShoppingCart size={18} />
              Tambahkan ke Keranjang
            </button>
          </div>

          <div className="space-y-6 pt-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Jaminan Layanan Kami</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">Kualitas Premium</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <Truck size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">Layanan Cepat</p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                  <RefreshCw size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">Garansi Retur</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
