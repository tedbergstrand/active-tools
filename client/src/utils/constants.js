export const CATEGORIES = {
  roped: { label: 'Roped Climbing', color: 'text-blue-500', bg: 'bg-blue-500', bgLight: 'bg-blue-500/10', border: 'border-blue-500', icon: 'Mountain' },
  bouldering: { label: 'Bouldering', color: 'text-amber-500', bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', border: 'border-amber-500', icon: 'Gem' },
  traditional: { label: 'Training', color: 'text-emerald-500', bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500', icon: 'Dumbbell' },
  mixed: { label: 'Mixed', color: 'text-purple-500', bg: 'bg-purple-500', bgLight: 'bg-purple-500/10', border: 'border-purple-500', icon: 'Layers' },
  tools: { label: 'Tools', color: 'text-violet-500', bg: 'bg-violet-500', bgLight: 'bg-violet-500/10', border: 'border-violet-500', icon: 'Wrench' },
};

export const SEND_TYPES = [
  { value: 'onsight', label: 'Onsight', color: 'text-yellow-400' },
  { value: 'flash', label: 'Flash', color: 'text-orange-400' },
  { value: 'redpoint', label: 'Redpoint', color: 'text-red-400' },
  { value: 'repeat', label: 'Repeat', color: 'text-green-400' },
  { value: 'attempt', label: 'Attempt', color: 'text-gray-400' },
  { value: 'project', label: 'Project', color: 'text-purple-400' },
];

export const WALL_ANGLES = ['Slab', 'Vertical', 'Slight Overhang', 'Overhang', 'Steep Overhang', 'Roof'];

export const GRIP_TYPES = ['Half Crimp', 'Full Crimp', 'Open Hand', 'Three Finger Drag', 'Two Finger Pocket', 'Pinch', 'Sloper'];

export const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
