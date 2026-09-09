export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 backdrop-blur border-t border-slate-200/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <span className="font-semibold text-slate-900">AI 动态追踪</span>
          </div>
          <p className="text-center text-sm text-slate-500">
            © {currentYear} AI 动态追踪 · 每天自动更新主流 AI 产品最新动态
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              自动运行中
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
