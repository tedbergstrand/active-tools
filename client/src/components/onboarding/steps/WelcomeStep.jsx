import { Mountain } from 'lucide-react';
import { Button } from '../../common/Button.jsx';

export function WelcomeStep({ onNext }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
      <div className="w-20 h-20 rounded-2xl bg-blue-600/20 flex items-center justify-center">
        <Mountain size={40} className="text-blue-400" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Active Tools</h1>
        <p className="text-gray-400 text-lg max-w-sm">
          Your climbing training companion. Log workouts, follow plans, and track your progress.
        </p>
      </div>
      <Button size="lg" onClick={onNext} className="px-12">
        Get Started
      </Button>
    </div>
  );
}
