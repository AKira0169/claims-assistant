import Link from 'next/link';

const SCAN_LINES = Array.from({ length: 14 });

const STATS = [
  { label: 'Avg. Intake Time', value: '< 3min', color: 'bg-brutal-mint' },
  { label: 'AI Accuracy', value: '95%+', color: 'bg-brutal-yellow' },
  { label: 'Fields Auto-filled', value: '12+', color: 'bg-brutal-peach' },
] as const;

export default function Home() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <h2 className="brutal-heading text-5xl md:text-6xl leading-[0.95]">
            SUBMIT<br />
            CLAIMS<br />
            <span className="text-brutal-pink">SMARTER</span>
          </h2>
          <p className="font-mono text-base text-brutal-black/70 max-w-md leading-relaxed">
            AI-assisted data extraction and validation.
            Faster intake. Fewer errors. Better outcomes.
          </p>
        </div>
        <div className="w-full md:w-72 relative select-none min-h-[280px]">
          <div className="absolute top-4 left-4 w-48 h-56 bg-white border-[3px] border-brutal-black shadow-brutal-lg">
            <div className="p-3 space-y-2">
              <div className="h-2 w-20 bg-brutal-black/15" />
              <div className="h-2 w-full bg-brutal-black/10" />
              <div className="h-2 w-full bg-brutal-black/10" />
              <div className="h-2 w-3/4 bg-brutal-black/10" />
              <div className="mt-3 h-2 w-16 bg-brutal-pink/40" />
              <div className="h-2 w-full bg-brutal-black/10" />
              <div className="h-2 w-full bg-brutal-black/10" />
              <div className="h-2 w-1/2 bg-brutal-black/10" />
              <div className="mt-3 grid grid-cols-2 gap-1">
                <div className="h-6 bg-brutal-yellow/30 border border-brutal-black/10" />
                <div className="h-6 bg-brutal-mint/30 border border-brutal-black/10" />
              </div>
            </div>
          </div>

          <div className="absolute left-20 top-0 w-48 h-56 bg-brutal-yellow border-[3px] border-brutal-black shadow-brutal flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {SCAN_LINES.map((_, i) => (
                <div key={i} className="h-4 border-b border-brutal-black" />
              ))}
            </div>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="relative z-10">
              <circle cx="40" cy="28" r="8" fill="#1a1a1a" />
              <circle cx="22" cy="48" r="6" fill="#FF3366" />
              <circle cx="58" cy="48" r="6" fill="#0066FF" />
              <circle cx="40" cy="62" r="5" fill="#1a1a1a" />
              <line x1="40" y1="36" x2="22" y2="42" stroke="#1a1a1a" strokeWidth="2.5" />
              <line x1="40" y1="36" x2="58" y2="42" stroke="#1a1a1a" strokeWidth="2.5" />
              <line x1="22" y1="54" x2="40" y2="57" stroke="#1a1a1a" strokeWidth="2.5" />
              <line x1="58" y1="54" x2="40" y2="57" stroke="#1a1a1a" strokeWidth="2.5" />
              <circle cx="12" cy="32" r="3" fill="#B8FF00" />
              <line x1="32" y1="28" x2="15" y2="32" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="66" cy="32" r="3" fill="#B8FF00" />
              <line x1="48" y1="28" x2="63" y2="32" stroke="#1a1a1a" strokeWidth="1.5" />
            </svg>
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest mt-2 relative z-10">
              AI Engine
            </div>
          </div>

          <div className="absolute bottom-2 right-0 bg-brutal-pink text-white px-3 py-1.5 border-[3px] border-brutal-black font-mono text-[10px] font-bold uppercase shadow-brutal-sm z-10">
            GPT-4o
          </div>
          <div className="absolute top-0 right-0 bg-brutal-lime px-2 py-1 border-2 border-brutal-black font-mono text-[10px] font-bold z-10">
            LIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/claims/new" className="brutal-card p-6 block group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-brutal-blue border-[3px] border-brutal-black flex items-center justify-center">
              <span className="text-white text-xl">+</span>
            </div>
            <span className="brutal-tag bg-brutal-lime">New</span>
          </div>
          <h3 className="brutal-heading text-2xl mb-2">NEW CLAIM</h3>
          <p className="font-mono text-sm text-brutal-black/60 leading-relaxed">
            Submit a new insurance claim with AI-assisted
            data extraction and validation.
          </p>
          <div className="mt-4 pt-4 border-t-2 border-dashed border-brutal-black/20 flex items-center gap-2 font-mono text-sm font-bold uppercase text-brutal-blue">
            Start filing
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </Link>

        <Link href="/claims" className="brutal-card p-6 block group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-brutal-lavender border-[3px] border-brutal-black flex items-center justify-center">
              <span className="text-brutal-black text-xl font-bold">#</span>
            </div>
            <span className="brutal-tag bg-brutal-lime">Live</span>
          </div>
          <h3 className="brutal-heading text-2xl mb-2">VIEW CLAIMS</h3>
          <p className="font-mono text-sm text-brutal-black/60 leading-relaxed">
            Browse, search, and manage all submitted
            claims with AI-powered chat assistant.
          </p>
          <div className="mt-4 pt-4 border-t-2 border-dashed border-brutal-black/20 flex items-center gap-2 font-mono text-sm font-bold uppercase text-brutal-blue">
            Browse claims
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className={`${stat.color} border-[3px] border-brutal-black p-4 shadow-brutal-sm`}>
            <div className="brutal-heading text-3xl md:text-4xl">{stat.value}</div>
            <div className="font-mono text-sm text-brutal-black/70 mt-1 uppercase">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
