import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import UpdateCard from '@/components/UpdateCard';
import { getProducts, getUpdates, getProductUpdateCount, getProductLastUpdated } from '@/lib/data';

export default function Home() {
  const products = getProducts();
  const updates = getUpdates(20);

  const productsWithStats = products.map(product => ({
    ...product,
    update_count: getProductUpdateCount(product.slug),
    last_updated: getProductLastUpdated(product.slug),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-to-r from-blue-100/50 via-purple-100/30 to-pink-100/30 rounded-full opacity-60"></div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 text-sm text-slate-600 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            每日自动更新
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            AI 动态追踪
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            每天自动追踪 ChatGPT、豆包、Gemini、Claude、Grok 等主流 AI 产品的最新动态
          </p>
        </section>

        {/* Products Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">追踪的产品</h2>
            <span className="text-sm text-slate-500">{products.length} 款产品</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsWithStats.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
