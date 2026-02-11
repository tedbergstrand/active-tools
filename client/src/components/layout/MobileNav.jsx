import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mountain, Gem, Wrench, Menu } from 'lucide-react';
import { useState } from 'react';
import { Plus, ClipboardList, BarChart3, Timer, Settings, X, Dumbbell } from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/bouldering', icon: Gem, label: 'Boulder' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/roped', icon: Mountain, label: 'Rope' },
  { to: null, icon: Menu, label: 'More' },
];

const moreItems = [
  { to: '/training', icon: Dumbbell, label: 'Training' },
  { to: '/log', icon: Plus, label: 'Log Workout' },
  { to: '/plans', icon: ClipboardList, label: 'Plans' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/timer', icon: Timer, label: 'Timer' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-16 left-0 right-0 bg-[#1a1d27] border-t border-[#2e3347] rounded-t-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-400">More</span>
              <button onClick={() => setShowMore(false)} className="p-2 -mr-1 hover:bg-[#2e3347] active:bg-[#3e4357] rounded-lg transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1.5 p-4 rounded-xl text-sm transition-colors
                    ${isActive ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-[#0f1117] active:bg-[#252838]'}`
                  }
                >
                  <item.icon size={24} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#1a1d27] border-t border-[#2e3347] lg:hidden">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab, i) =>
            tab.to ? (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors
                  ${isActive ? 'text-blue-400' : 'text-gray-500'}`
                }
              >
                <tab.icon size={22} />
                {tab.label}
              </NavLink>
            ) : (
              <button
                key={i}
                onClick={() => setShowMore(!showMore)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors
                  ${showMore ? 'text-blue-400' : 'text-gray-500'}`}
              >
                <tab.icon size={22} />
                {tab.label}
              </button>
            )
          )}
        </div>
      </nav>
    </>
  );
}
