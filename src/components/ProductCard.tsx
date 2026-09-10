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
      className="group relative flex flex-col items-center text-center bg-white/90 backdrop-blur rounded-2xl border border-slate-200/80 p-5 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300/80 hover:bg-white transition-all duration-300 overflow-hidden"
    >
      {/* 顶部品牌色条 */}
      <div
        className="absolute top-0 left-4 right-4 h-1 rounded-b-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: product.color }}
      ></div>
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
        style={{ backgroundColor: product.color }}
      ></div>

      {/* 大图标 */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md mb-3"
        style={{ backgroundColor: `${product.color}15`, color: product.color }}
      >
        {product.icon || product.name.charAt(0)}
      </div>

      {/* 名称 */}
      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
        {product.name}
      </h3>

      {/* 动态数徽章 */}
      <span
        className="mt-2 text-xs font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: `${product.color}12`, color: product.color }}
      >
        {product.update_count} 条动态
      </span>

      {/* 简短描述 */}
      <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>

      {product.last_updated && (
        <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          最新：{new Date(product.last_updated).toLocaleDateString('zh-CN')}
        </p>
      )}

      <div className="mt-4 flex items-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: product.color }}>
        查看全部动态
        <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
