'use client';

import { useState, useEffect, useCallback } from 'react';

import { API_URL } from '../../../lib/api';

export interface ClaimFilters {
  status: string;
  type: string;
  priority: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ClaimSummary {
  id: string;
  claimNumber: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  incidentDate: string | null;
  estimatedAmount: number | null;
  createdAt: string;
  updatedAt: string;
  claimant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    policyNumber: string;
  } | null;
}

const initialFilters: ClaimFilters = {
  status: '',
  type: '',
  priority: '',
  search: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useClaims() {
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<ClaimFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    try {
      const res = await fetch(`${API_URL}/claims?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch claims');
      const result = await res.json();
      setClaims(result.data);
      setTotal(result.total);
    } catch (err) {
      setError('Failed to load claims. Please try again.');
      setClaims([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const updateFilters = useCallback((updates: Partial<ClaimFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, []);

  return {
    claims,
    total,
    page,
    limit,
    filters,
    isLoading,
    error,
    setPage,
    setLimit,
    updateFilters,
    clearFilters,
    refetch: fetchClaims,
  };
}
