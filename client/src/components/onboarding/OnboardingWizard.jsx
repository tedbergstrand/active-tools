import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { WelcomeStep } from './steps/WelcomeStep.jsx';
import { ExperienceStep } from './steps/ExperienceStep.jsx';
import { DisciplineStep } from './steps/DisciplineStep.jsx';
import { GradeStep } from './steps/GradeStep.jsx';
import { GoalStep } from './steps/GoalStep.jsx';
import { PlanStep } from './steps/PlanStep.jsx';
import { settingsApi } from '../../api/settings.js';
import { useSettings } from '../settings/SettingsContext.jsx';
import { Button } from '../common/Button.jsx';

const TOTAL_STEPS = 6;

export function OnboardingWizard() {
  const { refresh } = useSettings();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    experience_level: '',
    primary_discipline: '',
    max_roped_grade: '',
    max_boulder_grade: '',
    training_goal: '',
  });

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const canAdvance = () => {
    switch (step) {
      case 1: return !!data.experience_level;
      case 2: return !!data.primary_discipline;
      case 3: return true; // grades are optional
      case 4: return !!data.training_goal;
      default: return true;
    }
  };

  const finishOnboarding = async () => {
    try {
      await settingsApi.update({
        ...data,
        onboarding_completed: 'true',
      });
      refresh();
    } catch {
      // Even if save fails, let the user through
      refresh();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <WelcomeStep onNext={next} />;
      case 1: return <ExperienceStep value={data.experience_level} onChange={v => { update('experience_level', v); next(); }} />;
      case 2: return <DisciplineStep value={data.primary_discipline} onChange={v => { update('primary_discipline', v); next(); }} />;
      case 3: return <GradeStep discipline={data.primary_discipline} ropedGrade={data.max_roped_grade} boulderGrade={data.max_boulder_grade} onRopedChange={v => update('max_roped_grade', v)} onBoulderChange={v => update('max_boulder_grade', v)} />;
      case 4: return <GoalStep value={data.training_goal} onChange={v => { update('training_goal', v); next(); }} />;
      case 5: return <PlanStep goal={data.training_goal} discipline={data.primary_discipline} onComplete={finishOnboarding} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0f1117] overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header with back button and progress */}
        {step > 0 && (
          <div className="flex items-center justify-between mb-6">
            <button onClick={back} className="p-2 -ml-2 text-gray-400 hover:text-gray-200">
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-[#2e3347]'}`} />
              ))}
            </div>
            <div className="w-10" /> {/* spacer */}
          </div>
        )}

        {/* Step content */}
        <div className="flex-1 flex flex-col justify-center">
          {renderStep()}
        </div>

        {/* Next button for steps that don't auto-advance */}
        {(step === 3) && (
          <div className="pt-6">
            <Button onClick={next} className="w-full" disabled={!canAdvance()}>
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
