import { GradePicker } from '../../workout/GradePicker.jsx';
import { useSettings } from '../../settings/SettingsContext.jsx';

export function GradeStep({ discipline, ropedGrade, boulderGrade, onRopedChange, onBoulderChange }) {
  const { settings } = useSettings();
  const ropeSystem = settings.grade_system || 'yds';
  const boulderSystem = settings.boulder_grade_system || 'v_scale';

  const showRoped = discipline === 'roped' || discipline === 'both';
  const showBoulder = discipline === 'bouldering' || discipline === 'both';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Current Grades</h2>
        <p className="text-gray-400 mt-1">What's the hardest grade you've sent?</p>
      </div>
      <div className="space-y-5">
        {showRoped && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Max Roped Grade</label>
            <GradePicker value={ropedGrade} onChange={onRopedChange} system={ropeSystem} className="w-full" />
          </div>
        )}
        {showBoulder && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Max Boulder Grade</label>
            <GradePicker value={boulderGrade} onChange={onBoulderChange} system={boulderSystem} className="w-full" />
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 text-center">
        This helps us calibrate plan difficulty. You can always change it later in settings.
      </p>
    </div>
  );
}
