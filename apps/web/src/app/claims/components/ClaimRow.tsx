'use client';

import { ClaimStatus, ClaimPriority } from '@claims-assistant/shared';
import { ClaimSummary } from '../hooks/useClaims';
import { ClaimDetail } from './ClaimDetail';

const STATUS_COLORS: Record<ClaimStatus, string> = {
  [ClaimStatus.DRAFT]: 'bg-white',
  [ClaimStatus.SUBMITTED]: 'bg-brutal-blue text-white',
  [ClaimStatus.UNDER_REVIEW]: 'bg-brutal-yellow',
  [ClaimStatus.APPROVED]: 'bg-brutal-lime',
  [ClaimStatus.REJECTED]: 'bg-brutal-pink text-white',
};

const PRIORITY_COLORS: Record<ClaimPriority, string> = {
  [ClaimPriority.LOW]: 'bg-white',
  [ClaimPriority.MEDIUM]: 'bg-brutal-yellow',
  [ClaimPriority.HIGH]: 'bg-brutal-peach',
  [ClaimPriority.URGENT]: 'bg-brutal-pink text-white',
};

interface ClaimRowProps {
  claim: ClaimSummary;
  isExpanded: boolean;
  onToggle: () => void;
  innerRef?: React.RefObject<HTMLTableRowElement | null>;
}

export function ClaimRow({ claim, isExpanded, onToggle, innerRef }: ClaimRowProps) {
  const claimantName = claim.claimant
    ? `${claim.claimant.firstName} ${claim.claimant.lastName}`
    : '\u2014';

  return (
    <>
      <tr
        ref={innerRef}
        onClick={onToggle}
        className={`cursor-pointer font-mono text-sm transition-colors hover:bg-brutal-yellow/10 ${
          isExpanded ? 'bg-brutal-yellow/5' : ''
        }`}
      >
        <td className="px-4 py-3 font-bold">{claim.claimNumber}</td>
        <td className="px-4 py-3">
          <span className="brutal-tag text-xs">{claim.type}</span>
        </td>
        <td className="px-4 py-3">
          <span className={`brutal-tag text-xs ${STATUS_COLORS[claim.status as ClaimStatus] || ''}`}>
            {claim.status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`brutal-tag text-xs ${PRIORITY_COLORS[claim.priority as ClaimPriority] || ''}`}>
            {claim.priority}
          </span>
        </td>
        <td className="px-4 py-3">{claimantName}</td>
        <td className="px-4 py-3 text-brutal-black/60">
          {claim.incidentDate
            ? new Date(claim.incidentDate).toLocaleDateString()
            : '\u2014'}
        </td>
        <td className="px-4 py-3 text-right font-bold">
          {claim.estimatedAmount != null
            ? `$${claim.estimatedAmount.toLocaleString()}`
            : '\u2014'}
        </td>
        <td className="px-4 py-3 text-center text-brutal-black/40">
          {isExpanded ? '\u25B2' : '\u25BC'}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={8} className="p-0">
            <ClaimDetail claimId={claim.id} />
          </td>
        </tr>
      )}
    </>
  );
}
