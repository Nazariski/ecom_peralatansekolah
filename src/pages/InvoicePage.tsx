import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, CheckCircle2, Package, ArrowLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      toast.error('Gagal memuat invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-20">Memuat invoice...</div>;
  if (!order) return <div className="text-center py-20">Invoice tidak ditemukan</div>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between no-print">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">1</div>
            <span className="text-sm">Keranjang</span>
          </div>
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">2</div>
            <span className="text-sm">Checkout</span>
          </div>
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">3</div>
            <span className="text-sm">Invoice</span>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono italic font-medium uppercase tracking-widest hidden md:block">
          EDU/INV/{new Date().getFullYear()}
        </span>
      </div>

      <div className="flex justify-between items-center mb-8 no-print">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-medium transition-colors text-sm">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
          >
            <Printer size={16} /> Cetak Invoice
          </button>
        </div>
      </div>

      <div className="bg-white p-12 md:p-16 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden" id="printable-invoice">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">E</div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                EduStore <span className="text-blue-600 font-medium text-sm">School Supplies</span>
              </span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tighter italic">Official Invoice</h1>
              <p className="text-slate-400 font-medium font-mono text-sm uppercase tracking-widest mt-1">Inv No. {order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          
          <div className="md:text-right space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
              order.status === 'PAID' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {order.status === 'PAID' ? 'Status: Paid & Verified' : 'Status: Pending'}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Terbit</p>
              <p className="text-slate-800 font-bold italic text-sm">{new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-16">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Penagihan</h3>
            <div className="space-y-1">
              <p className="text-slate-800 font-bold text-lg uppercase tracking-tight">{order.customer_name}</p>
              <p className="text-slate-500 text-sm font-medium">{order.phone}</p>
              <p className="text-slate-400 text-sm italic font-medium leading-relaxed max-w-xs">{order.address}</p>
            </div>
          </div>
          
          <div className="md:text-right space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metode Pembayaran</h3>
            <div className="space-y-1">
              <p className="text-slate-800 font-bold uppercase text-sm">{order.payment_method}</p>
              <p className="text-slate-500 text-xs italic font-medium">Automatic system verification successful</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-y border-slate-100">
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest w-16">No</th>
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest">Detail Produk</th>
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-center w-24">Qty</th>
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-right">Harga Satuan</th>
                  <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {order.items.map((item: any, index: number) => (
                  <tr key={item.id} className="group">
                    <td className="py-6 text-slate-300 font-mono text-xs">{String(index + 1).padStart(2, '0')}</td>
                    <td className="py-6">
                      <p className="text-slate-800 font-bold uppercase tracking-tight">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">School Grade Equipment</p>
                    </td>
                    <td className="py-6 text-center text-slate-800 font-bold">{item.quantity}</td>
                    <td className="py-6 text-right text-slate-500 font-medium italic">Rp {item.price.toLocaleString('id-ID')}</td>
                    <td className="py-6 text-right text-slate-900 font-bold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-12 border-t-2 border-slate-800">
          <div className="w-full md:w-80 space-y-4">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Subtotal Pesanan</span>
              <span className="text-slate-800">Rp {order.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Layanan Pengiriman</span>
              <span className="text-blue-600">Gratis</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-900 uppercase tracking-tighter pt-6 border-t border-slate-100 items-end">
              <span>Total Akhir</span>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-[0.3em]">Nett Amount</span>
                <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 flex justify-between items-end border-t border-slate-100 pt-12">
          <div className="space-y-4">
            <div className="p-4 border-2 border-slate-800 border-dashed rounded-xl transform -rotate-1 max-w-xs">
              <p className="text-slate-800 font-bold text-xs uppercase tracking-widest leading-relaxed">
                Thank you for choosing EduStore. Your investment in education is an investment in the future.
              </p>
            </div>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em] italic">
              Verification Code: 0x{order.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-900 font-bold text-xs uppercase tracking-[0.2em] mb-8">Authorized Digital Signature</p>
            <div className="w-32 h-px bg-slate-200 ml-auto mb-2"></div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">EduStore Financial Department</p>
          </div>
        </div>
      </div>
    </div>
  );
}
