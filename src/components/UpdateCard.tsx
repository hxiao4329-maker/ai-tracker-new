interface Update {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  source_url: string | null;
  source_type: string;
  published_at: string | null;
  fetched_at: string;
  is_new: boolean;
  product_slug: string;
  product_name: string;
  product_color: string;
}

interface UpdateCardProps {
  update: Update;
  showProduct?: boolean;
}

export default function UpdateCard({ update, showProduct = false }: UpdateCardProps) {
  const date = update.published_at || update.fetched_at;

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {showProduct && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: update.product_color || '#64748b' }}
              >
                {update.product_name}
              </span>
            )}
            {update.is_new && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                最新
              </span>
            )}
            <span className="text-xs text-slate-400">
              {new Date(date).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">{update.title}</h3>
          {update.summary && (
            <p className="text-sm text-slate-600 line-clamp-3">{update.summary}</p>
          )}
        </div>
      </div>
      {update.source_url && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <a
            href={update.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            查看原文 →
          </a>
        </div>
      )}
    </article>
  );
}
