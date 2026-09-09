"use client";

export default function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 左上角大光斑 */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/30 blur-3xl"></div>
      {/* 右下角大光斑 */}
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-200/25 blur-3xl"></div>
      {/* 中间偏右小光斑 */}
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-pink-200/20 blur-3xl"></div>
      {/* 细网格 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #64748b 1px, transparent 1px),
            linear-gradient(to bottom, #64748b 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      ></div>
    </div>
  );
}
