import { useState, useEffect } from 'react';
import { Grid2X2, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';

export default function CategoriesPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/products', window.location.origin);
      if (selectedCategory) url.searchParams.append('categoryId', selectedCategory.id);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Grid2X2 className="text-blue-500" size={28} /> Jelajahi Katolog
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">Temukan kebutuhan belajar lebih cepat sesuai kategori</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Kategori */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 block border-b border-slate-100 pb-2">Filter Kategori</h2>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-left transition-all italic border ${!selectedCategory ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
              >
                Semua Produk
              </button>
              {categories.map((cat: any) => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-left transition-all italic border ${selectedCategory?.id === cat.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden hidden lg:block">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-12 -translate-y-12" />
            <h3 className="text-lg font-bold tracking-tight mb-2 relative z-10 italic">Promo Semester Baru!</h3>
            <p className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-80 leading-relaxed mb-4 relative z-10">Diskon hingga 40% untuk tas dan buku khusus kategori "Back to School"</p>
            <div className="text-[10px] font-bold uppercase tracking-widest bg-white/20 inline-block px-3 py-1 rounded relative z-10">CEK SEKARANG</div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="mb-8 flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">
                {selectedCategory ? selectedCategory.name : 'Semua Katalog'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                Ditemukan {products.length} Item Berkualitas
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/5] bg-slate-200 rounded-xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={selectedCategory?.id || 'all'}
              className="grid grid-cols-2 md:grid-cols-3 gap-6"
            >
              {products.map((product: any) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} />
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase italic tracking-widest">Belum ada stok produk untuk kategori ini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
