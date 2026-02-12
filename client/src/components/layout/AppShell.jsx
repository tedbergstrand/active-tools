import { useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { MobileNav } from './MobileNav.jsx';
import { MobileHeader } from './Header.jsx';
import { TimerFloatingWidget } from '../timer/TimerFloatingWidget.jsx';
import { ToolSessionFloatingWidget } from '../tools/ToolSessionFloatingWidget.jsx';
import { ToolSessionRunner } from '../tools/ToolSessionRunner.jsx';
import { useToolSession } from '../tools/ToolSessionContext.jsx';
import { OnboardingWizard } from '../onboarding/OnboardingWizard.jsx';
import { useSettings } from '../settings/SettingsContext.jsx';

export function AppShell() {
  const toolSession = useToolSession();
  const { settings } = useSettings();

  const handleStartNext = useCallback((nextTool) => {
    const config = nextTool.default_config ? JSON.parse(nextTool.default_config) : {};
    toolSession.startSession(nextTool, config);
  }, [toolSession]);

  if (settings.onboarding_completed !== 'true') {
    return <OnboardingWizard />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileHeader />
      <main className="lg:ml-60 px-4 lg:px-8 py-6 pb-24 lg:pb-6">
        <Outlet />
      </main>
      <MobileNav />
      <TimerFloatingWidget />
      <ToolSessionFloatingWidget />

      {/* Tool session overlay — stays mounted when minimized to keep audio running */}
      {toolSession.isActive && (
        <div
          className={`fixed inset-0 z-50 bg-[#12141c] overflow-y-auto ${
            toolSession.minimized ? 'invisible pointer-events-none' : ''
          }`}
        >
          <div className="max-w-lg mx-auto px-4 py-6">
            <ToolSessionRunner
              tool={toolSession.session.tool}
              initialConfig={toolSession.session.config}
              onClose={toolSession.endSession}
              onMinimize={toolSession.minimize}
              sessionStateRef={toolSession.sessionStateRef}
              onStartNext={handleStartNext}
            />
          </div>
        </div>
      )}
    </div>
  );
}
