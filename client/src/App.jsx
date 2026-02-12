import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TimerProvider } from './components/timer/TimerContext.jsx';
import { ToolSessionProvider } from './components/tools/ToolSessionContext.jsx';
import { SettingsProvider } from './components/settings/SettingsContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { AppShell } from './components/layout/AppShell.jsx';
import { Dashboard } from './pages/Dashboard.jsx';

const RopedClimbing = lazy(() => import('./pages/RopedClimbing.jsx'));
const Bouldering = lazy(() => import('./pages/Bouldering.jsx'));
const TraditionalExercise = lazy(() => import('./pages/TraditionalExercise.jsx'));
const LogWorkout = lazy(() => import('./pages/LogWorkout.jsx'));
const WorkoutDetail = lazy(() => import('./pages/WorkoutDetail.jsx'));
const EditWorkout = lazy(() => import('./pages/EditWorkout.jsx'));
const WorkoutHistory = lazy(() => import('./pages/WorkoutHistory.jsx'));
const CreatePlan = lazy(() => import('./pages/CreatePlan.jsx'));
const Plans = lazy(() => import('./pages/Plans.jsx'));
const PlanDetailPage = lazy(() => import('./pages/PlanDetailPage.jsx'));
const Progress = lazy(() => import('./pages/Progress.jsx'));
const TimerPage = lazy(() => import('./pages/TimerPage.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const TrainingTools = lazy(() => import('./pages/TrainingTools.jsx'));
const ToolSession = lazy(() => import('./pages/ToolSession.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
      <ToastProvider>
      <TimerProvider>
        <ToolSessionProvider>
          <ErrorBoundary>
          <Suspense fallback={null}>
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
          </Suspense>
          </ErrorBoundary>
        </ToolSessionProvider>
      </TimerProvider>
      </ToastProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
