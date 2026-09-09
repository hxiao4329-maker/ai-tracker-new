import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UpdateCard from '@/components/UpdateCard';
import { getProducts, getProductBySlug, getUpdatesByProduct } from '@/lib/data';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const products = getProducts();
  return products.map(product => ({
    slug: product.slug,
  }));
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }

  const updates = getUpdatesByProduct(params.slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <a 
          href="/" 
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首页
        </a>

        {/* Product Header */}
        <section 
          className="relative overflow-hidden rounded-3xl border p-8 sm:p-10 mb-10 text-white"
          style={{ backgroundColor: product.color || '#64748b', borderColor: `${product.color}40` || '#64748b40' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl shadow-lg">
              {product.icon || product.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">{product.name}</h1>
              <p className="mt-2 text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">{product.description}</p>
              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-sm font-semibold transition-colors"
              >
                访问官网
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-4xl font-bold">{updates.length}</div>
              <div className="text-sm text-white/80">条动态</div>
            </div>
          </div>
        </section>

        {/* Updates List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">全部动态</h2>
            <span className="text-sm text-slate-500">{updates.length} 条更新</span>
          </div>
          <div className="space-y-4">
            {updates.length > 0 ? (
              updates.map(update => (
                <UpdateCard key={update.id} update={update} />
              ))
            ) : (
              <div className="text-center py-16 bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-500">暂无动态数据</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
