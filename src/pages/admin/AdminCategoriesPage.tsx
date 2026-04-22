import React from 'react';
import { useState, useEffect } from 'react';
import { Grid2X2, Plus, Trash2, Edit, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast.error('Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        toast.success(editId ? 'Kategori diperbarui' : 'Kategori ditambahkan');
        setShowModal(false);
        resetForm();
        fetchCategories();
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setName('');
    setEditId(null);
  };

  const handleEdit = (cat: any) => {
    setEditId(cat.id);
    setName(cat.name);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Semua produk dalam kategori ini mungkin akan bermasalah.')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Kategori terhapus');
        fetchCategories();
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
            <Grid2X2 size={24} className="text-blue-600" /> Manajemen Kategori
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola Pengelompokan Produk</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-bold">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200">
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Nama Kategori</th>
                <th className="px-6 py-4 text-right uppercase tracking-widest text-[10px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-6 py-10 text-center text-slate-400 italic">Memuat data kategori...</td>
                </tr>
              ) : categories.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-slate-800 uppercase tracking-tight">{c.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
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

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              {editId ? 'Edit Kategori' : 'Kategori Baru'}
            </h2>
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
              <X size={24} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Nama Kategori</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Alat Tulis Kantor"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> {editId ? 'Perbarui Kategori' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
