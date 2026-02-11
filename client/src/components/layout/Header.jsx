import { Mountain } from 'lucide-react';

export function Header({ title, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function MobileHeader() {
  return (
    <div className="lg:hidden flex items-center gap-2 px-4 py-3 bg-[#1a1d27] border-b border-[#2e3347]">
      <Mountain className="text-blue-500" size={22} />
      <span className="font-bold text-lg">ClimbTracker</span>
    </div>
  );
}
