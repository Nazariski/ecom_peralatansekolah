export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white/50 py-16 border-t border-slate-800 no-print">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">E</div>
              <span className="text-lg font-bold tracking-tight text-white italic">EduStore</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm italic font-medium">
              Destinasi utama untuk perlengkapan pendidikan berkualitas tinggi. Kami berkomitmen untuk mendukung masa depan cerah putra-putri anda melalui akses peralatan sekolah yang lengkap dan terjangkau.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-[10px] uppercase tracking-[0.3em]">Quick Navigation</h4>
            <ul className="space-y-3 text-[10px] uppercase font-bold tracking-widest italic">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Hubungi Kami</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Bantuan Toko</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-[10px] uppercase tracking-[0.3em]">Stay Connected</h4>
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all cursor-pointer font-bold text-[10px]">IG</div>
              <div className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all cursor-pointer font-bold text-[10px]">TW</div>
              <div className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all cursor-pointer font-bold text-[10px]">IN</div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono opacity-50">© {new Date().getFullYear()} EDUSTORE INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest opacity-50">
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Privacy Policy</span>
            <span className="cursor-pointer hover:opacity-100 transition-opacity">Legal Notice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
