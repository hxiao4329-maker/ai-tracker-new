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
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            AI 动态追踪
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            每天自动追踪 ChatGPT、豆包、Gemini、Claude、Grok 等主流 AI 产品的最新动态
          </p>
        </section>

        {/* Products Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">追踪的产品</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsWithStats.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Latest Updates */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">最新动态</h2>
          <div className="space-y-4">
            {updates.length > 0 ? (
              updates.map(update => (
                <UpdateCard key={update.id} update={update} showProduct />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
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
