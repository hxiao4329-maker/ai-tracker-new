"use client";

import { useEffect, useState } from 'react';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  icon: string;
  color: string;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.floor(easeOutQuart * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display}{suffix}</span>;
}

export default function StatsWidget({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="relative overflow-hidden bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all group"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div
            className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
            style={{ backgroundColor: stat.color }}
          ></div>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </div>
        </div>
      ))}
    </div>
  );
}
