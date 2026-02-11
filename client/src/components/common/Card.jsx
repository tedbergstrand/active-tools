export function Card({ className = '', children, onClick, ...props }) {
  return (
    <div
      className={`bg-[#1a1d27] border border-[#2e3347] rounded-xl ${onClick ? 'cursor-pointer hover:bg-[#1f2333] transition-colors' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`px-5 py-4 border-b border-[#2e3347] ${className}`}>{children}</div>;
}

export function CardContent({ className = '', children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
