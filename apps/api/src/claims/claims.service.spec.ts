import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsService } from './claims.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ClaimsService', () => {
  let service: ClaimsService;

  const mockClaims = [
    {
      id: '1',
      claimNumber: 'CLM-2026-00001',
      type: 'AUTO',
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      description: 'Car accident',
      incidentDate: new Date('2026-03-15'),
      estimatedAmount: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
      claimant: { firstName: 'John', lastName: 'Smith' },
    },
  ];

  const mockPrismaService = {
    claim: {
      findMany: jest.fn().mockResolvedValue(mockClaims),
      count: jest.fn().mockResolvedValue(1),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    claimant: { upsert: jest.fn() },
    claimDetails: { upsert: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated claims with no filters', async () => {
      const result = await service.findAll();
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { claimant: true },
        }),
      );
      expect(result.data).toEqual(mockClaims);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should apply status filter with comma-separated values', async () => {
      await service.findAll({ status: 'SUBMITTED,APPROVED' });
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['SUBMITTED', 'APPROVED'] },
          }),
        }),
      );
    });

    it('should apply type filter', async () => {
      await service.findAll({ type: 'AUTO' });
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'AUTO' }),
        }),
      );
    });

    it('should apply search filter with OR clause', async () => {
      await service.findAll({ search: 'smith' });
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ claimNumber: expect.any(Object) }),
              expect.objectContaining({ description: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });

    it('should apply date range filter', async () => {
      await service.findAll({ dateFrom: '2026-01-01', dateTo: '2026-12-31' });
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            incidentDate: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-12-31'),
            },
          }),
        }),
      );
    });

    it('should apply custom sorting', async () => {
      await service.findAll({ sortBy: 'estimatedAmount', sortOrder: 'asc' });
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { estimatedAmount: 'asc' },
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      await service.findAll({ page: 3, limit: 10 });
      expect(mockPrismaService.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });
});
