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
      className="group block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
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
    </Link>
  );
}
