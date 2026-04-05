import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Claims Assistant',
  description: 'AI-powered claim submission assistant for insurance agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="h-2 bg-brutal-yellow" />

        <header className="bg-white border-b-[3px] border-brutal-black">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brutal-pink border-[3px] border-brutal-black shadow-brutal-sm flex items-center justify-center">
                <span className="font-display text-white text-lg leading-none">C</span>
              </div>
              <h1 className="font-display text-2xl tracking-tight">
                CLAIMS<span className="text-brutal-pink">.</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="brutal-tag bg-brutal-yellow">Agent Portal</span>
              <div className="w-8 h-8 bg-brutal-blue border-2 border-brutal-black flex items-center justify-center">
                <span className="text-white text-xs font-bold">AP</span>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-brutal-black text-brutal-yellow py-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap font-mono text-xs font-bold tracking-widest">
            {'AI-POWERED CLAIMS /// FAST INTAKE /// SMART EXTRACTION /// AUTOMATED VALIDATION /// '
              .repeat(4)}
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>

        <div className="h-2 bg-brutal-pink" />
      </body>
    </html>
  );
}
