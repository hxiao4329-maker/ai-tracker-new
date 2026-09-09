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
    <article className="group bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg hover:border-slate-300/80 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {showProduct && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${update.product_color}12`, color: update.product_color }}
              >
                {update.product_name}
              </span>
            )}
            {update.is_new && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                最新
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(date).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{update.title}</h3>
          {update.summary && (
            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{update.summary}</p>
          )}
        </div>
      </div>
      {update.source_url && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <a
            href={update.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all"
            style={{ color: update.product_color }}
          >
            查看原文
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </article>
  );
}
