import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import UpdateCard from '@/components/UpdateCard';
import { getDb, seedProducts } from '@/lib/db';

export const revalidate = 3600;

interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  website_url: string;
  icon_url: string;
  color: string;
  update_count: number;
  last_updated: string | null;
}

interface Update {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  source_url: string | null;
  source_type: string;
  published_at: string | null;
  fetched_at: string;
  is_new: number;
  product_slug: string;
  product_name: string;
  color: string;
}

export default async function Home() {
  seedProducts();
  const db = getDb();

  const products = db.prepare(`
    SELECT 
      p.id, p.slug, p.name, p.description, p.website_url, p.icon_url, p.color,
      COUNT(u.id) as update_count,
      MAX(u.published_at) as last_updated
    FROM products p
    LEFT JOIN updates u ON p.id = u.product_id
    GROUP BY p.id
    ORDER BY p.id
  `).all() as Product[];

  const updates = db.prepare(`
    SELECT 
      u.id, u.title, u.summary, u.content, u.source_url, u.source_type,
      u.published_at, u.fetched_at, u.is_new,
      p.slug as product_slug, p.name as product_name, p.color
    FROM updates u
    JOIN products p ON u.product_id = p.id
    ORDER BY u.published_at DESC, u.fetched_at DESC
    LIMIT 20
  `).all() as Update[];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              追踪主流 AI 产品的每一次更新
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl">
              每天自动聚合 ChatGPT、豆包、Gemini、Claude、Grok 的最新动态，
              让你第一时间掌握 AI 领域的新功能与发布内容。
            </p>
          </div>
        </section>

        {/* Products */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">追踪的产品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Latest Updates */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">最新动态</h2>
          </div>
          {updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <UpdateCard key={update.id} update={update} showProduct />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500">暂无更新数据，等待每日自动同步...</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
