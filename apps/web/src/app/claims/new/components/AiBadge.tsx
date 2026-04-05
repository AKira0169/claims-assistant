'use client';

interface AiBadgeProps {
  confidence: 'high' | 'medium' | 'low';
}

export function AiBadge({ confidence }: AiBadgeProps) {
  const colors = {
    high: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded border ${colors[confidence]}`}>
      AI \u00b7 {confidence}
    </span>
  );
}
