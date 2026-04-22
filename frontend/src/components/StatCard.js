const iconMap = {
  balance: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v1H7a3 3 0 0 0 0 6h13v1a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 14.5v-7Z" />
      <path d="M20 9H7a2 2 0 1 0 0 4h13V9Z" />
      <circle cx="16" cy="11" r=".75" fill="currentColor" stroke="none" />
    </svg>
  ),
  income: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
      <path d="M5 19h14" />
    </svg>
  ),
  expense: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14" />
      <path d="m18 13-6 6-6-6" />
      <path d="M5 5h14" />
    </svg>
  ),
  savings: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v18" />
      <path d="M17 7.5c0-1.9-2.24-3.5-5-3.5s-5 1.6-5 3.5 2.24 3.5 5 3.5 5 1.6 5 3.5-2.24 3.5-5 3.5-5-1.6-5-3.5" />
    </svg>
  ),
  health: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 13.5C4 9.36 7.36 6 11.5 6h1C16.64 6 20 9.36 20 13.5S16.64 21 12.5 21h-1C7.36 21 4 17.64 4 13.5Z" />
      <path d="M8.5 13.5 11 16l4.5-5" />
    </svg>
  )
};

const StatCard = ({ title, value, helperText, iconKey, accentClass }) => {
  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{helperText}</p>
        </div>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentClass}`}>
          {iconMap[iconKey]}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
