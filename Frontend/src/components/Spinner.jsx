import React from 'react';

const Spinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`animate-spin rounded-full border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent ${sizeClasses[size]}`}></div>
      {message && <p className="text-slate-400 text-sm animate-pulse-subtle">{message}</p>}
    </div>
  );
};

export default Spinner;
