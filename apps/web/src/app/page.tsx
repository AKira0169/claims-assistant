import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/claims/new"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">New Claim</h3>
          <p className="text-gray-600 text-sm">
            Submit a new insurance claim with AI-assisted data extraction and validation.
          </p>
        </Link>
      </div>
    </div>
  );
}
