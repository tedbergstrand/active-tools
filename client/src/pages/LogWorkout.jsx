import { Header } from '../components/layout/Header.jsx';
import { WorkoutForm } from '../components/workout/WorkoutForm.jsx';

export function LogWorkout() {
  return (
    <div>
      <Header title="Log Workout" />
      <WorkoutForm />
    </div>
  );
}
