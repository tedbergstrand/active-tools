const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
  secondary: 'bg-[#1a1d27] hover:bg-[#1f2333] active:bg-[#252838] text-gray-200 border border-[#2e3347]',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
  ghost: 'hover:bg-[#1a1d27] active:bg-[#252838] text-gray-300',
  roped: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
  bouldering: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white',
  traditional: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
  timer: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
};

const sizes = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-6 py-3.5 text-base min-h-[48px]',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
