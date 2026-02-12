import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Mountain, Gem, Dumbbell, ClipboardList,
  BarChart3, Timer, Settings, Plus, Wrench, History
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roped', icon: Mountain, label: 'Roped Climbing', color: 'text-blue-500' },
  { to: '/bouldering', icon: Gem, label: 'Bouldering', color: 'text-amber-500' },
  { to: '/training', icon: Dumbbell, label: 'Training', color: 'text-emerald-500' },
  { divider: true },
  { to: '/log', icon: Plus, label: 'Log Workout' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/plans', icon: ClipboardList, label: 'Plans' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/timer', icon: Timer, label: 'Timer', color: 'text-red-500' },
  { to: '/tools', icon: Wrench, label: 'Tools', color: 'text-violet-500' },
  { divider: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen bg-[#1a1d27] border-r border-[#2e3347] fixed left-0 top-0">
      <div className="px-5 py-5 border-b border-[#2e3347]">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Mountain className="text-blue-500" size={24} />
          ClimbTracker
        </h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) =>
          item.divider ? (
            <div key={i} className="my-3 border-t border-[#2e3347]" />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-[#0f1117]'}`
              }
            >
              <item.icon size={20} className={item.color || ''} />
              {item.label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}
