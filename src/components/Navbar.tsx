import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Search, BookOpen } from 'lucide-react';

export default function Navbar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to={user?.role === 'ADMIN' ? "/admin" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">H</div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            HapisStore <span className="text-blue-600 font-medium text-sm">Perlengkapan Sekolah</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          {user?.role === 'ADMIN' ? (
            <Link to="/admin" className={`${pathname.startsWith('/admin') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-slate-800'} transition-all`}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/" className={`${pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-slate-800'} transition-all`}>
                Jelajah
              </Link>
              <Link to="/categories" className={`${pathname === '/categories' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-slate-800'} transition-all`}>
                Kategori
              </Link>
              <Link to="/cart" className={`${pathname === '/cart' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-slate-800'} transition-all`}>
                Keranjang
              </Link>
              {user && (
                <Link to="/orders" className={`${pathname === '/orders' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-slate-800'} transition-all`}>
                  Pesanan
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user?.role !== 'ADMIN' && (
            <Link to="/cart" className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <ShoppingCart size={20} />
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{user.role}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <User size={16} />
              </div>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="p-2 text-blue-600 transition-colors">
                  <LayoutDashboard size={20} />
                </Link>
              )}
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-100">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
