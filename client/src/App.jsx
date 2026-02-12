import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TimerProvider } from './components/timer/TimerContext.jsx';
import { ToolSessionProvider } from './components/tools/ToolSessionContext.jsx';
import { SettingsProvider } from './components/settings/SettingsContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { RopedClimbing } from './pages/RopedClimbing.jsx';
import { Bouldering } from './pages/Bouldering.jsx';
import { TraditionalExercise } from './pages/TraditionalExercise.jsx';
import { LogWorkout } from './pages/LogWorkout.jsx';
import { WorkoutDetail } from './pages/WorkoutDetail.jsx';
import { EditWorkout } from './pages/EditWorkout.jsx';
import { WorkoutHistory } from './pages/WorkoutHistory.jsx';
import { CreatePlan } from './pages/CreatePlan.jsx';
import { Plans } from './pages/Plans.jsx';
import { PlanDetailPage } from './pages/PlanDetailPage.jsx';
import { Progress } from './pages/Progress.jsx';
import { TimerPage } from './pages/TimerPage.jsx';
import { Settings } from './pages/Settings.jsx';
import { TrainingTools } from './pages/TrainingTools.jsx';
import { ToolSession } from './pages/ToolSession.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
      <ToastProvider>
      <TimerProvider>
        <ToolSessionProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/roped" element={<RopedClimbing />} />
              <Route path="/bouldering" element={<Bouldering />} />
              <Route path="/training" element={<TraditionalExercise />} />
              <Route path="/log/:category?" element={<LogWorkout />} />
              <Route path="/workout/:id" element={<WorkoutDetail />} />
              <Route path="/workout/:id/edit" element={<EditWorkout />} />
              <Route path="/history" element={<WorkoutHistory />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/plans/new" element={<CreatePlan />} />
              <Route path="/plans/:id" element={<PlanDetailPage />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/tools" element={<TrainingTools />} />
              <Route path="/tools/:slug" element={<ToolSession />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </ToolSessionProvider>
      </TimerProvider>
      </ToastProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
