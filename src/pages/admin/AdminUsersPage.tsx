import React from 'react';
import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, X, Save, Shield, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error('Gagal memuat user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const url = editId ? `/api/admin/users/${editId}` : '/api/admin/users';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        toast.success(editId ? 'User diperbarui' : 'User ditambahkan');
        setShowModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'USER' });
    setEditId(null);
  };

  const handleEdit = (user: any) => {
    setEditId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('User terhapus');
        fetchUsers();
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
            <Users size={24} className="text-blue-600" /> Manajemen User
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola Akun & Hak Akses</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={16} /> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-bold">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200">
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Nama & Email</th>
                <th className="px-6 py-4 text-left uppercase tracking-widest text-[10px]">Role</th>
                <th className="px-6 py-4 text-right uppercase tracking-widest text-[10px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">Memuat data user...</td>
                </tr>
              ) : users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="text-slate-800 uppercase tracking-tight">{u.name}</p>
                        <p className="text-[10px] text-slate-400 italic font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {u.role === 'ADMIN' && <Shield size={10} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(u)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)} 
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-20"
                        disabled={u.email === 'admin@edustore.com'}
                      >
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
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              {editId ? 'Edit User' : 'User Baru'}
            </h2>
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 transition-colors">
              <X size={24} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Nama Lengkap</label>
                  <input 
                    type="text" required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Email</label>
                  <input 
                    type="email" required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Role</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={form.role}
                    onChange={(e) => setForm({...form, role: e.target.value})}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                    {editId ? 'Password (kosongkan jika tidak ganti)' : 'Password'}
                  </label>
                  <input 
                    type="password" required={!editId}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> {editId ? 'Perbarui User' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
