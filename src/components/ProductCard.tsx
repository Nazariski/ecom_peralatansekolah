import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: any }) {
  const [quantity, setQuantity] = React.useState(1);

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
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
        toast.success(`Berhasil ditambahkan ${quantity} ke keranjang`);
      } else {
        toast.error('Gagal menambahkan ke keranjang');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="aspect-square bg-slate-50 overflow-hidden relative border-b border-slate-100">
        <img 
          src={product.image || '/placeholder-product.png'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-slate-800 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Stok Habis</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 block">
          {product.category?.name}
        </span>
        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex flex-col gap-3 mt-4">
          <p className="text-slate-900 font-bold text-sm tracking-tight text-center sm:text-left">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
          
          <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-3">
            <div 
              className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-8"
              onClick={(e) => e.preventDefault()}
            >
              <button 
                onClick={(e) => { e.preventDefault(); setQuantity(Math.max(1, quantity - 1)); }}
                className="px-2.5 hover:bg-slate-200 transition-colors font-bold text-slate-500 disabled:opacity-30"
                disabled={quantity <= 1 || product.stock === 0}
              >
                <Minus size={12} />
              </button>
              <div className="px-2 font-mono font-bold text-slate-800 border-x border-slate-200 min-w-[28px] text-center text-xs">
                {quantity}
              </div>
              <button 
                onClick={(e) => { e.preventDefault(); setQuantity(Math.min(product.stock, quantity + 1)); }}
                className="px-2.5 hover:bg-slate-200 transition-colors font-bold text-slate-500 disabled:opacity-30"
                disabled={quantity >= product.stock || product.stock === 0}
              >
                <Plus size={12} />
              </button>
            </div>

            <button 
              onClick={addToCart}
              disabled={product.stock === 0}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex-grow flex justify-center"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
