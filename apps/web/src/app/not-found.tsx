import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="brutal-card p-8 text-center max-w-md">
        <h1 className="brutal-heading text-4xl mb-4">404</h1>
        <p className="font-mono text-sm text-brutal-black/70 mb-6">
          Page not found.
        </p>
        <Link href="/" className="brutal-btn brutal-btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
