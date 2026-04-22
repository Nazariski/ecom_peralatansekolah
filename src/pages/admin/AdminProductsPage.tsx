import React from 'react';
import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit, X, Save, Image as ImageIcon, History, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [history, setHistory] = useState([]);
  const [restockAmount, setRestockAmount] = useState('');
  const [restockNote, setRestockNote] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchHistory = async (productId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/products/${productId}/stock-history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setHistory(data);
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/restock`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: restockAmount, note: restockNote })
      });

      if (res.ok) {
        toast.success(`Stok ${selectedProduct.name} berhasil ditambahkan`);
        setShowRestockModal(false);
        setRestockAmount('');
        setRestockNote('');
        fetchProducts();
      }
    } catch (err) {
      toast.error('Gagal menambah stok');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('categoryId', form.categoryId);
    if (imageFile) formData.append('image', imageFile);

    try {
      const url = editId ? `/api/admin/products/${editId}` : '/api/admin/products';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast.success(editId ? 'Produk diperbarui' : 'Produk ditambahkan');
        setShowModal(false);
        resetForm();
        fetchProducts();
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setForm({ name: '', price: '', stock: '', categoryId: '' });
    setImageFile(null);
    setEditId(null);
  };

  const handleEdit = (product: any) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId,
    });
    setShowModal(true);
  };

  const openRestock = (product: any) => {
    setSelectedProduct(product);
    setShowRestockModal(true);
  };

  const openHistory = (product: any) => {
    setSelectedProduct(product);
    fetchHistory(product.id);
    setShowHistoryModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Produk terhapus');
        fetchProducts();
      }
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic flex items-center gap-2">
            <Package size={24} className="text-blue-600" /> Manajemen Inventaris
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola Barang & Lacak Arus Stok</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={16} /> Produk Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-bold">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200">
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Produk</th>
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Kategori</th>
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Harga</th>
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Stok</th>
                <th className="px-6 py-4 text-right uppercase tracking-widest text-[10px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Memuat data produk...</td>
                </tr>
              ) : products.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" referrerPolicy="no-referrer" />
                      <span className="text-slate-800 uppercase tracking-tight line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 uppercase tracking-tighter text-xs">{p.category?.name}</td>
                  <td className="px-6 py-4 text-blue-600 italic">Rp {p.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.stock} Unit
                      </span>
                      <button 
                        onClick={() => openRestock(p)}
                        className="text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                        title="Tambah Stok"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openHistory(p)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Riwayat Stok">
                        <History size={18} />
                      </button>
                      <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Data">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD/EDIT PRODUCT */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              {editId ? 'Edit Produk' : 'Produk Baru'}
            </h2>
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
              <X size={24} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Nama Produk</label>
                  <input 
                    type="text" required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 italic font-bold"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Harga (Rp)</label>
                  <input 
                    type="number" required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Stok Awal</label>
                  <input 
                    type="number" required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={form.stock}
                    onChange={(e) => setForm({...form, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Kategori</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={form.categoryId}
                    onChange={(e) => setForm({...form, categoryId: e.target.value})}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Gambar Produk</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-grow flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                      <ImageIcon size={18} className="text-slate-400 group-hover:text-blue-500" />
                      <span className="text-xs font-bold text-slate-500">{imageFile ? imageFile.name : 'Pilih File Gambar'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> {editId ? 'Perbarui Produk' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESTOCK */}
      {showRestockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-2 flex items-center gap-2">
              Tambah Stok
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{selectedProduct?.name}</p>
            <button onClick={() => setShowRestockModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
              <X size={24} />
            </button>

            <form onSubmit={handleRestock} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Jumlah Tambahan</label>
                <input 
                  type="number" required 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  placeholder="Masukkan angka (ex: 50)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Catatan (Opsional)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold italic"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="Contoh: Stok masuk dari supplier"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle size={20} /> Tambah Ke Inventaris
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTORY */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative overflow-hidden flex flex-col max-h-[80vh]">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-2 flex items-center gap-2">
              Riwayat Arus Stok
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{selectedProduct?.name}</p>
            <button onClick={() => setShowHistoryModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
              <X size={24} />
            </button>

            <div className="flex-grow overflow-y-auto pr-2">
              <div className="space-y-4">
                {history.map((h: any) => (
                  <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          h.type === 'RESTOCK' ? 'bg-blue-100 text-blue-700' : 
                          h.type === 'SALE' ? 'bg-red-100 text-red-700' : 
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {h.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono italic">
                          {new Date(h.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 mt-2 italic group-hover:text-slate-800 transition-colors">{h.note || 'Tidak ada catatan'}</p>
                    </div>
                    <div className={`text-xl font-black italic tracking-tighter ${h.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {h.change > 0 ? '+' : ''}{h.change}
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-center text-slate-400 italic py-8">Belum ada riwayat stok.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
