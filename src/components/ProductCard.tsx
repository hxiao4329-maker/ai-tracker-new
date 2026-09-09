import Link from 'next/link';

interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  website_url: string;
  icon_url: string;
  icon: string;
  color: string;
  update_count: number;
  last_updated: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative block bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300/80 transition-all duration-300 overflow-hidden"
    >
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
        style={{ backgroundColor: product.color }}
      ></div>
      <div className="flex items-start justify-between mb-4 relative">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md"
          style={{ backgroundColor: `${product.color}15`, color: product.color }}
        >
          {product.icon || product.name.charAt(0)}
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${product.color}12`, color: product.color }}
        >
          {product.update_count} 条动态
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
        {product.name}
      </h3>
      <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">{product.description}</p>
      {product.last_updated && (
        <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          最新更新：{new Date(product.last_updated).toLocaleDateString('zh-CN')}
        </p>
      )}
      <div className="mt-4 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: product.color }}>
        查看全部动态
        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
