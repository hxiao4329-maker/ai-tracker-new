import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UpdateCard from '@/components/UpdateCard';
import { getDb, seedProducts } from '@/lib/db';

export const revalidate = 3600;

export async function generateStaticParams() {
  seedProducts();
  const db = getDb();
  const products = db.prepare('SELECT slug FROM products').all() as { slug: string }[];
  return products.map((p) => ({ slug: p.slug }));
}

interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  website_url: string;
  icon_url: string;
  color: string;
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

export default async function ProductPage({ params }: { params: { slug: string } }) {
  seedProducts();
  const db = getDb();

  const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(params.slug) as Product | undefined;

  if (!product) {
    notFound();
  }

  const updates = db.prepare(`
    SELECT 
      u.id, u.title, u.summary, u.content, u.source_url, u.source_type,
      u.published_at, u.fetched_at, u.is_new,
      p.slug as product_slug, p.name as product_name, p.color
    FROM updates u
    JOIN products p ON u.product_id = p.id
    WHERE p.slug = ?
    ORDER BY u.published_at DESC, u.fetched_at DESC
  `).all(params.slug) as Update[];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Product Hero */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 inline-block"
            >
              ← 返回首页
            </Link>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: product.color || '#64748b' }}
              >
                {product.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                <a
                  href={product.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  访问官网 →
                </a>
              </div>
            </div>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl">{product.description}</p>
          </div>
        </section>

        {/* Updates */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">历史更新</h2>
          {updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <UpdateCard key={update.id} update={update} />
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
