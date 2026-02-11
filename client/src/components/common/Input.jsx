export function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-400">{label}</label>}
      <input
        className={`w-full bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-gray-100
          placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-400">{label}</label>}
      <textarea
        className={`w-full bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-gray-100
          placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none ${className}`}
        rows={3}
        {...props}
      />
    </div>
  );
}
