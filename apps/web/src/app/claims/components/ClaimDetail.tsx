'use client';

import { useState, useEffect } from 'react';

import { API_URL } from '../../../lib/api';

interface ClaimDetailProps {
  claimId: string;
}

export function ClaimDetail({ claimId }: ClaimDetailProps) {
  const [claim, setClaim] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/claims/${claimId}`)
      .then((res) => res.json())
      .then(setClaim)
      .catch(() => setClaim(null))
      .finally(() => setIsLoading(false));
  }, [claimId]);

  if (isLoading) {
    return (
      <div className="p-4 bg-brutal-yellow/10 font-mono text-sm font-bold uppercase tracking-wider">
        /// Loading details...
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="p-4 bg-brutal-pink/10 font-mono text-sm">
        Failed to load claim details.
      </div>
    );
  }

  return (
    <div className="border-t-[3px] border-brutal-black divide-y-[3px] divide-brutal-black bg-cream/50 brutal-animate-in">
      {/* Claimant */}
      {claim.claimant && (
        <div className="p-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black/50 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-brutal-pink" /> Claimant
          </h4>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 font-mono text-sm">
            <dt className="text-brutal-black/50 uppercase text-xs">Name:</dt>
            <dd className="font-bold">{claim.claimant.firstName} {claim.claimant.lastName}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Policy:</dt>
            <dd className="font-bold">{claim.claimant.policyNumber}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Email:</dt>
            <dd className="font-bold">{claim.claimant.email || '\u2014'}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Phone:</dt>
            <dd className="font-bold">{claim.claimant.phone || '\u2014'}</dd>
          </dl>
        </div>
      )}

      {/* Description */}
      <div className="p-4">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black/50 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-brutal-blue" /> Description
        </h4>
        <p className="font-mono text-sm text-brutal-black/80 whitespace-pre-wrap leading-relaxed">
          {claim.description}
        </p>
      </div>

      {/* Claim Details */}
      {claim.claimDetails && (
        <div className="p-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black/50 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-brutal-lavender" /> {claim.claimDetails.detailType} Details
          </h4>
          <dl className="grid grid-cols-2 gap-y-2 gap-x-4 font-mono text-sm">
            {Object.entries(claim.claimDetails.data || {}).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-brutal-black/50 uppercase text-xs">{key.replace(/([A-Z])/g, ' $1').trim()}:</dt>
                <dd className="font-bold">{String(value) || '\u2014'}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Documents */}
      {claim.documents && claim.documents.length > 0 && (
        <div className="p-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black/50 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-brutal-peach" /> Documents ({claim.documents.length})
          </h4>
          <div className="space-y-1">
            {claim.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-2 font-mono text-sm">
                <span className="brutal-tag bg-white text-xs">{doc.fileType}</span>
                <span className="font-bold">{doc.fileName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
