import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        toast.success(`Selamat datang kembali, ${data.user.name}!`);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">E</div>
            <span className="text-xl font-bold tracking-tight text-slate-800 italic">EduStore</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Selamat Datang</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2 italic">Akses akun belajar anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-1">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="email" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="password" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 uppercase tracking-[0.2em] text-xs italic"
          >
            {loading ? 'Authenticating...' : 'Masuk Sekarang'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline">Daftar disini</Link>
        </p>
      </div>
    </div>
  );
}
