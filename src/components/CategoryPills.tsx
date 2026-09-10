"use client";

interface Category {
  name: string;
  count: number;
  color: string;
}

export default function CategoryPills({ categories }: { categories: Category[] }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">来源分布</h3>
        <span className="text-xs text-slate-400">{categories.reduce((a, b) => a + b.count, 0)} 条</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <div
            key={cat.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            style={{
              backgroundColor: `${cat.color}10`,
              borderColor: `${cat.color}25`,
              color: cat.color,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cat.color }}
            ></span>
            {cat.name}
            <span className="text-xs opacity-70">{cat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
