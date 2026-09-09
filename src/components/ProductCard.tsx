import Link from 'next/link';

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
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: product.color || '#64748b' }}
        >
          {product.name.charAt(0)}
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {product.update_count} 条动态
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
        {product.name}
      </h3>
      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
      {product.last_updated && (
        <p className="mt-4 text-xs text-slate-400">
          最新更新：{new Date(product.last_updated).toLocaleDateString('zh-CN')}
        </p>
      )}
    </Link>
  );
}
