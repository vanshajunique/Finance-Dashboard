const iconMap = {
  wallet: "◔",
  "trend-up": "↗",
  "trend-down": "↘",
  alert: "!",
  shield: "✓",
  spark: "✦",
  "forecast-up": "→",
  "forecast-down": "↓"
};

const InsightCard = ({ insight }) => {
  const messages = Array.isArray(insight.message) ? insight.message : [insight.message];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-lg font-semibold text-cyan-700">
          {iconMap[insight.icon] || "•"}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">{insight.title}</h3>
          <div className="mt-3 space-y-2">
            {messages.map((message) => (
              <p key={message} className="text-sm leading-6 text-slate-600">
                {message}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;

