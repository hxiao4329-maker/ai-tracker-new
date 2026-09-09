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
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Product Header */}
        <section className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: product.color || '#64748b' }}
            >
              {product.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
              <p className="mt-2 text-slate-600">{product.description}</p>
              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                访问官网 →
              </a>
            </div>
          </div>
        </section>

        {/* Updates List */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            全部动态 ({updates.length})
          </h2>
          <div className="space-y-4">
            {updates.length > 0 ? (
              updates.map(update => (
                <UpdateCard key={update.id} update={update} />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
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
