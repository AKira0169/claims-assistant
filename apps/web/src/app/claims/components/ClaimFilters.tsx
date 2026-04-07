'use client';

import { useState, useEffect } from 'react';
import { ClaimStatus, ClaimType, ClaimPriority } from '@claims-assistant/shared';
import { ClaimFilters as ClaimFiltersType } from '../hooks/useClaims';
import { BrutalDatePicker } from '../../../components/BrutalDatePicker';

const STATUSES = Object.values(ClaimStatus);
const TYPES = Object.values(ClaimType);
const PRIORITIES = Object.values(ClaimPriority);

interface ClaimFiltersProps {
  filters: ClaimFiltersType;
  onFilterChange: (updates: Partial<ClaimFiltersType>) => void;
  onClear: () => void;
}

export function ClaimFilters({ filters, onFilterChange, onClear }: ClaimFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, filters.search, onFilterChange]);

  const activeStatuses = filters.status ? filters.status.split(',') : [];

  const toggleStatus = (status: string) => {
    const updated = activeStatuses.includes(status)
      ? activeStatuses.filter((s) => s !== status)
      : [...activeStatuses, status];
    onFilterChange({ status: updated.join(',') });
  };

  const hasActiveFilters =
    filters.status || filters.type || filters.priority || filters.search || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search claims..."
        className="brutal-input text-sm"
      />

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        <span className="font-mono text-xs font-bold uppercase text-brutal-black/40 self-center mr-1">
          Status:
        </span>
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`brutal-tag text-xs cursor-pointer transition-all ${
              activeStatuses.includes(status)
                ? 'bg-brutal-blue text-white'
                : 'bg-white hover:bg-brutal-yellow/30'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Dropdowns and dates */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ type: e.target.value })}
          className="brutal-input text-sm w-auto min-w-[140px]"
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onFilterChange({ priority: e.target.value })}
          className="brutal-input text-sm w-auto min-w-[140px]"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <div className="w-auto min-w-[170px]">
          <BrutalDatePicker
            selected={filters.dateFrom ? new Date(filters.dateFrom) : null}
            onChange={(date) => onFilterChange({ dateFrom: date ? date.toISOString().split('T')[0] : '' })}
            placeholderText="From date"
            isClearable
            selectsStart
            startDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
            endDate={filters.dateTo ? new Date(filters.dateTo) : null}
          />
        </div>
        <div className="w-auto min-w-[170px]">
          <BrutalDatePicker
            selected={filters.dateTo ? new Date(filters.dateTo) : null}
            onChange={(date) => onFilterChange({ dateTo: date ? date.toISOString().split('T')[0] : '' })}
            placeholderText="To date"
            isClearable
            selectsEnd
            startDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
            endDate={filters.dateTo ? new Date(filters.dateTo) : null}
            minDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
          />
        </div>

        {hasActiveFilters && (
          <button onClick={onClear} className="brutal-btn brutal-btn-secondary text-xs px-3 py-2">
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
