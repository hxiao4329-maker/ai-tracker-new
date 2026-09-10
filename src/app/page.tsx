import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import UpdateCard from '@/components/UpdateCard';
import StatsWidget from '@/components/StatsWidget';
import CategoryPills from '@/components/CategoryPills';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { getProducts, getUpdates, getProductUpdateCount, getProductLastUpdated, getProductsByRegion } from '@/lib/data';

export default function Home() {
  const products = getProducts();
  const domesticProducts = getProductsByRegion('domestic');
  const overseasProducts = getProductsByRegion('overseas');
  const allUpdates = getUpdates();
  const updates = allUpdates.slice(0, 20);

  const withStats = (list: typeof products) => list.map(product => ({
    ...product,
    update_count: getProductUpdateCount(product.slug),
    last_updated: getProductLastUpdated(product.slug),
  }));
  const productsWithStats = withStats(products);
  const domesticWithStats = withStats(domesticProducts);
  const overseasWithStats = withStats(overseasProducts);

  const totalUpdates = allUpdates.length;
  const todayUpdates = allUpdates.filter(u => {
    const d = new Date(u.published_at || u.fetched_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const newProducts = products.length;
  const newThisWeek = allUpdates.filter(u => {
    const d = new Date(u.published_at || u.fetched_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  const stats = [
    { label: '总动态', value: totalUpdates, suffix: '+', icon: '📊', color: '#3b82f6' },
    { label: '今日更新', value: todayUpdates, suffix: '', icon: '🔥', color: '#ef4444' },
    { label: '追踪产品', value: newProducts, suffix: ' 款', icon: '🤖', color: '#10b981' },
    { label: '本周新增', value: newThisWeek, suffix: '', icon: '⚡', color: '#8b5cf6' },
  ];

  const categories = productsWithStats.map(p => ({
    name: p.name,
    count: p.update_count,
    color: p.color,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative">
      <BackgroundDecorations />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Hero Section */}
        <section className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-r from-blue-200/40 via-purple-200/30 to-pink-200/30 rounded-full opacity-70 scale-110"></div>

          {/* 顶部装饰小徽章 */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              每日自动更新
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50/80 backdrop-blur border border-indigo-100 text-xs font-medium text-indigo-600 shadow-sm">
              <span>🤖</span>
              {products.length} 款 AI 产品
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/80 backdrop-blur border border-amber-100 text-xs font-medium text-amber-600 shadow-sm">
              <span>⚡</span>
              实时聚合
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              AI 动态追踪
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            聚合国内与海外主流 AI 产品动态，按国产、海外两大板块分类追踪
          </p>

          {/* 数据摘要条 */}
          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-white/60 backdrop-blur border border-slate-200/60 shadow-sm text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span><strong className="text-slate-900">{totalUpdates}+</strong> 条动态</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span><strong className="text-slate-900">{todayUpdates}</strong> 条今日更新</span>
            </div>
            <div className="w-px h-4 bg-slate-300 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-lg">🚀</span>
              <span>UTC 02:00 自动同步</span>
            </div>
          </div>
        </section>

        {/* Stats Widget */}
        <StatsWidget stats={stats} />

        {/* Products Grid - 海外在左，国内在右 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* 海外板块 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🌍</span>
              <h2 className="text-2xl font-bold text-slate-900">海外 AI</h2>
              <span className="text-sm text-slate-500 ml-auto">{overseasProducts.length} 款</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {overseasWithStats.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* 国内板块 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🇨🇳</span>
              <h2 className="text-2xl font-bold text-slate-900">国内 AI</h2>
              <span className="text-sm text-slate-500 ml-auto">{domesticProducts.length} 款</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {domesticWithStats.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* 分类来源分布 */}
        <section className="mb-16">
          <CategoryPills categories={categories} />
        </section>

        {/* Latest Updates */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">最新动态</h2>
            <span className="text-sm text-slate-500">{updates.length} 条</span>
          </div>
          <div className="space-y-4">
            {updates.length > 0 ? (
              updates.map(update => (
                <UpdateCard key={update.id} update={update} showProduct />
              ))
            ) : (
              <div className="text-center py-16 bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-500">暂无动态数据，请稍后刷新</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
