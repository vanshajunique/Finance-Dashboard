const EmptyState = ({ title, description, action }) => {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/90 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-2xl text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
        ○
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
