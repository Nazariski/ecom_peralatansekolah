import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import InvoicePage from './pages/InvoicePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderHistoryPage from './pages/OrderHistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow max-w-6xl mx-auto px-6 py-12 w-full">
          <Routes>
            <Route 
              path="/" 
              element={user?.role === 'ADMIN' ? <Navigate to="/admin" /> : <HomePage />} 
            />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/invoice/:id" element={<InvoicePage />} />
            <Route path="/login" element={<LoginPage onLogin={setUser} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/products" 
              element={user?.role === 'ADMIN' ? <AdminProductsPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/categories" 
              element={user?.role === 'ADMIN' ? <AdminCategoriesPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/users" 
              element={user?.role === 'ADMIN' ? <AdminUsersPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/orders" 
              element={user?.role === 'ADMIN' ? <AdminOrdersPage /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}
