'use client';

interface AiBadgeProps {
  confidence: 'high' | 'medium' | 'low';
}

const COLORS = {
  high: 'bg-brutal-lime text-brutal-black',
  medium: 'bg-brutal-yellow text-brutal-black',
  low: 'bg-brutal-pink text-white',
};

export function AiBadge({ confidence }: AiBadgeProps) {

  return (
    <span className={`brutal-tag ${COLORS[confidence]} text-[10px]`}>
      AI &middot; {confidence}
    </span>
  );
}
