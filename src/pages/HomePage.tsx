import { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/products', window.location.origin);
      if (selectedCategory) url.searchParams.append('categoryId', selectedCategory);
      if (search) url.searchParams.append('search', search);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-blue-600 p-8 md:p-16 text-white">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Siapkan Masa Depan <br /><span className="text-blue-200">Dengan Perlengkapan Terbaik</span>
            </h1>
            <p className="text-blue-100 mb-8 text-lg md:text-xl leading-relaxed">
              Dapatkan koleksi tas, buku, dan alat tulis premium hanya di EduStore. Mulai petualangan belajar hari ini!
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#products" className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2">
                Belanja Sekarang <ChevronRight size={20} />
              </a>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-20">
          <img src="belajar.png" alt="Hero" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
        </div>
      </section>

      {/* Search & Filter */}
      <section id="products" className="pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Koleksi Perlengkapan</h2>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Menampilkan produk terbaik kami</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari produk..." 
                className="w-full sm:w-60 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="w-full sm:w-44 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none font-medium text-slate-600"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/5] bg-slate-200 rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Tidak ada produk ditemukan</h3>
            <p className="text-slate-500 mt-2">Coba gunakan kata kunci atau kategori lain</p>
          </div>
        )}
      </section>
    </div>
  );
}
