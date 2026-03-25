export default function Stat({ label, value, icon, accent = false }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/40 via-violet-500/40 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-zinc-500 uppercase tracking-wider">{label}</div>
          <div className={`mt-2 text-5xl font-bold ${accent ? 'gradient-text' : 'text-white'}`}>
            {value}
          </div>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center text-violet-300">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
