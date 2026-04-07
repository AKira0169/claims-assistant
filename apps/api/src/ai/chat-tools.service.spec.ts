import { Test, TestingModule } from '@nestjs/testing';
import { ChatToolsService } from './chat-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimsService } from '../claims/claims.service';

describe('ChatToolsService', () => {
  let service: ChatToolsService;

  const mockClaim = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    claimNumber: 'CLM-2026-00001',
    type: 'AUTO',
    status: 'SUBMITTED',
    priority: 'MEDIUM',
    description: 'Car accident on highway',
    incidentDate: new Date('2026-03-15'),
    reportDate: new Date('2026-03-16'),
    estimatedAmount: 5000,
    createdBy: 'agent-001',
    createdAt: new Date(),
    updatedAt: new Date(),
    claimant: {
      id: 'claimant-1',
      claimId: '550e8400-e29b-41d4-a716-446655440000',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      phone: '555-0100',
      address: '123 Main St',
      policyNumber: 'POL-12345',
    },
  };

  const mockClaimsService = {
    findAll: jest.fn().mockResolvedValue({
      data: [mockClaim],
      total: 1,
      page: 1,
      limit: 10,
    }),
  };

  const mockPrismaService = {
    claim: {
      findMany: jest.fn().mockResolvedValue([mockClaim]),
      findUnique: jest.fn().mockResolvedValue(mockClaim),
      findFirst: jest.fn().mockResolvedValue(mockClaim),
      groupBy: jest.fn().mockResolvedValue([
        { status: 'SUBMITTED', _count: { id: 3 }, _sum: { estimatedAmount: 15000 } },
        { status: 'DRAFT', _count: { id: 2 }, _sum: { estimatedAmount: 8000 } },
      ]),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatToolsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ClaimsService, useValue: mockClaimsService },
      ],
    }).compile();

    service = module.get<ChatToolsService>(ChatToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchClaims', () => {
    it('should delegate to ClaimsService.findAll and return summaries', async () => {
      const result = await service.searchClaims({});
      expect(mockClaimsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 }),
      );
      expect(Array.isArray(result)).toBe(true);
      expect((result as any[])[0].claimNumber).toBe('CLM-2026-00001');
      expect((result as any[])[0].claimantName).toBe('John Smith');
    });

    it('should pass filters to ClaimsService.findAll', async () => {
      await service.searchClaims({ status: 'SUBMITTED', search: 'smith' });
      expect(mockClaimsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'SUBMITTED',
          search: 'smith',
        }),
      );
    });

    it('should cap limit at 20', async () => {
      await service.searchClaims({ limit: 50 });
      expect(mockClaimsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 }),
      );
    });

    it('should return error on failure', async () => {
      mockClaimsService.findAll.mockRejectedValueOnce(new Error('DB error'));
      const result = await service.searchClaims({});
      expect(result).toEqual({ error: 'Failed to search claims' });
    });
  });

  describe('getClaimById', () => {
    it('should find claim by UUID', async () => {
      const result = await service.getClaimById('550e8400-e29b-41d4-a716-446655440000');
      expect(mockPrismaService.claim.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '550e8400-e29b-41d4-a716-446655440000' },
        }),
      );
      expect((result as any).claimNumber).toBe('CLM-2026-00001');
    });

    it('should find claim by claim number', async () => {
      const result = await service.getClaimById('CLM-2026-00001');
      expect(mockPrismaService.claim.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { claimNumber: 'CLM-2026-00001' },
        }),
      );
      expect((result as any).claimNumber).toBe('CLM-2026-00001');
    });

    it('should return error when claim not found', async () => {
      mockPrismaService.claim.findFirst.mockResolvedValueOnce(null);
      const result = await service.getClaimById('CLM-9999-99999');
      expect(result).toEqual({ error: "Claim 'CLM-9999-99999' not found" });
    });

    it('should return error on failure', async () => {
      mockPrismaService.claim.findUnique.mockRejectedValueOnce(new Error('DB error'));
      const result = await service.getClaimById('550e8400-e29b-41d4-a716-446655440000');
      expect(result).toEqual({ error: 'Failed to retrieve claim' });
    });
  });

  describe('getClaimStats', () => {
    it('should group by status', async () => {
      const result = await service.getClaimStats('status');
      expect(mockPrismaService.claim.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: { id: true },
        _sum: { estimatedAmount: true },
      });
      expect(Array.isArray(result)).toBe(true);
      expect((result as any[])[0]).toEqual({
        group: 'SUBMITTED',
        count: 3,
        totalAmount: 15000,
      });
    });

    it('should return error on failure', async () => {
      mockPrismaService.claim.groupBy.mockRejectedValueOnce(new Error('DB error'));
      const result = await service.getClaimStats('status');
      expect(result).toEqual({ error: 'Failed to get claim statistics' });
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent claims with default limit', async () => {
      const result = await service.getRecentActivity();
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          orderBy: { updatedAt: 'desc' },
          include: { claimant: true },
        }),
      );
      expect(Array.isArray(result)).toBe(true);
    });

    it('should cap limit at 20', async () => {
      await service.getRecentActivity(50);
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });

    it('should return error on failure', async () => {
      mockPrismaService.claim.findMany.mockRejectedValueOnce(new Error('DB error'));
      const result = await service.getRecentActivity();
      expect(result).toEqual({ error: 'Failed to get recent activity' });
    });
  });
});
