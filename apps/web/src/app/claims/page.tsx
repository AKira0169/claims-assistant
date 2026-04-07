'use client';

import { useState, useRef, useCallback } from 'react';
import { useClaims } from './hooks/useClaims';
import { ClaimFilters } from './components/ClaimFilters';
import { ClaimsTable } from './components/ClaimsTable';
import { ChatPanel } from './components/ChatPanel';

export default function ClaimsPage() {
  const {
    claims,
    total,
    page,
    limit,
    filters,
    isLoading,
    updateFilters,
    clearFilters,
    setPage,
    setLimit,
  } = useClaims();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const claimRefs = useRef(new Map<string, React.RefObject<HTMLTableRowElement | null>>());

  const handleClaimClick = useCallback(
    (claimNumber: string) => {
      const claim = claims.find((c) => c.claimNumber === claimNumber);
      if (claim) {
        setExpandedClaimId(claim.id);
        const ref = claimRefs.current.get(claim.id);
        if (ref?.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
    [claims],
  );

  return (
    <div className="space-y-6 brutal-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="brutal-heading text-4xl">CLAIMS</h2>
          <p className="font-mono text-sm text-brutal-black/50 mt-1">
            Browse, search, and manage all claims
          </p>
        </div>
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`brutal-btn text-sm ${
            isChatOpen ? 'brutal-btn-accent' : 'brutal-btn-primary'
          }`}
        >
          <span className="w-2 h-2 bg-brutal-lime inline-block" />
          {isChatOpen ? 'Close AI' : 'AI Assistant'}
        </button>
      </div>

      {/* Filters */}
      <ClaimFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClear={clearFilters}
      />

      {/* Main content */}
      <div className="flex gap-6">
        <div className={`flex-1 min-w-0 ${isChatOpen ? 'w-[70%]' : 'w-full'}`}>
          <ClaimsTable
            claims={claims}
            total={total}
            page={page}
            limit={limit}
            isLoading={isLoading}
            expandedClaimId={expandedClaimId}
            onExpandClaim={setExpandedClaimId}
            onPageChange={setPage}
            onLimitChange={setLimit}
            claimRefs={claimRefs}
          />
        </div>

        {isChatOpen && (
          <div className="w-[30%] min-w-[320px] flex-shrink-0">
            <ChatPanel
              onToggle={() => setIsChatOpen(false)}
              onClaimClick={handleClaimClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
