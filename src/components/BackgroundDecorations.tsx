"use client";

export default function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 大光斑 */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-200/30 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-purple-200/25 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-pink-200/20 blur-[80px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      {/* 浮动几何球 */}
      <div className="absolute top-[15%] left-[8%] w-3 h-3 rounded-full bg-blue-400/40 blur-[1px] animate-float"></div>
      <div className="absolute top-[25%] right-[12%] w-2 h-2 rounded-full bg-purple-400/50 blur-[1px] animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-[30%] left-[15%] w-4 h-4 rounded-full bg-pink-400/30 blur-[1px] animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[20%] right-[20%] w-2.5 h-2.5 rounded-full bg-indigo-400/40 blur-[1px] animate-float" style={{ animationDelay: '3s' }}></div>

      {/* 细网格 */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #64748b 1px, transparent 1px),
            linear-gradient(to bottom, #64748b 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      ></div>

      {/* 顶部弧形光带 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[400px] bg-gradient-to-b from-blue-100/20 via-purple-50/10 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
}
