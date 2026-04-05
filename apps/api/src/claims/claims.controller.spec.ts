import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimType, ClaimPriority } from '@claims-assistant/shared';

describe('ClaimsController', () => {
  let controller: ClaimsController;
  let service: ClaimsService;

  const mockPrismaService = {
    claim: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    claimant: {
      upsert: jest.fn(),
    },
    claimDetails: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimsController],
      providers: [
        ClaimsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<ClaimsController>(ClaimsController);
    service = module.get<ClaimsService>(ClaimsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a draft claim', async () => {
      const dto = {
        type: ClaimType.AUTO,
        description: 'Car accident on highway',
        createdBy: 'agent-001',
      };

      const expected = {
        id: 'uuid-1',
        claimNumber: 'CLM-2026-00001',
        type: ClaimType.AUTO,
        status: 'DRAFT',
        priority: ClaimPriority.MEDIUM,
        description: dto.description,
        incidentDate: null,
        reportDate: new Date().toISOString(),
        estimatedAmount: null,
        createdBy: dto.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPrismaService.claim.create.mockResolvedValue(expected);
      mockPrismaService.claim.count.mockResolvedValue(0);

      const result = await controller.create(dto);
      expect(result).toEqual(expected);
      expect(mockPrismaService.claim.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a claim by id', async () => {
      const expected = {
        id: 'uuid-1',
        claimNumber: 'CLM-2026-00001',
        type: ClaimType.AUTO,
        status: 'DRAFT',
        claimant: null,
        claimDetails: null,
        documents: [],
      };

      mockPrismaService.claim.findUnique.mockResolvedValue(expected);

      const result = await controller.findOne('uuid-1');
      expect(result).toEqual(expected);
    });
  });
});
