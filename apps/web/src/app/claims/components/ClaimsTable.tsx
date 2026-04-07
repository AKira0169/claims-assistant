'use client';

import { useRef, createRef, useCallback } from 'react';
import { ClaimSummary } from '../hooks/useClaims';
import { ClaimRow } from './ClaimRow';

interface ClaimsTableProps {
  claims: ClaimSummary[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  expandedClaimId: string | null;
  onExpandClaim: (id: string | null) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  claimRefs: React.MutableRefObject<Map<string, React.RefObject<HTMLTableRowElement | null>>>;
}

export function ClaimsTable({
  claims,
  total,
  page,
  limit,
  isLoading,
  expandedClaimId,
  onExpandClaim,
  onPageChange,
  onLimitChange,
  claimRefs,
}: ClaimsTableProps) {
  const totalPages = Math.ceil(total / limit);

  const getRef = useCallback(
    (id: string) => {
      if (!claimRefs.current.has(id)) {
        claimRefs.current.set(id, createRef());
      }
      return claimRefs.current.get(id)!;
    },
    [claimRefs],
  );

  if (isLoading && claims.length === 0) {
    return (
      <div className="p-8 text-center font-mono text-sm font-bold uppercase tracking-wider text-brutal-black/40">
        /// Loading claims...
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="p-8 text-center border-[3px] border-dashed border-brutal-black/20 bg-white">
        <div className="w-12 h-12 bg-brutal-yellow/30 border-2 border-brutal-black/20 mx-auto mb-4 flex items-center justify-center">
          <span className="text-xl text-brutal-black/30">#</span>
        </div>
        <p className="font-mono text-sm text-brutal-black/50 font-bold uppercase">
          No claims found
        </p>
        <p className="font-mono text-xs text-brutal-black/30 mt-1">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border-[3px] border-brutal-black bg-white shadow-brutal overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-brutal-black text-white font-mono text-xs font-bold uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Claim #</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Claimant</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brutal-black/10">
            {claims.map((claim) => (
              <ClaimRow
                key={claim.id}
                claim={claim}
                isExpanded={expandedClaimId === claim.id}
                onToggle={() =>
                  onExpandClaim(expandedClaimId === claim.id ? null : claim.id)
                }
                innerRef={getRef(claim.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between font-mono text-sm">
        <div className="flex items-center gap-2 text-brutal-black/50">
          <span className="font-bold">{total}</span> claims total
          <span className="mx-2">&middot;</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="brutal-input text-xs w-auto py-1 px-2"
          >
            <option value={10}>10/page</option>
            <option value={20}>20/page</option>
            <option value={50}>50/page</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="brutal-btn brutal-btn-secondary text-xs px-3 py-1"
          >
            &larr; Prev
          </button>
          <span className="text-brutal-black/50 font-bold">
            {page} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="brutal-btn brutal-btn-secondary text-xs px-3 py-1"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
