import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimType } from '@claims-assistant/shared';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

describe('AiService', () => {
  let service: AiService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'test-key';
      return null;
    }),
  };

  const mockPrismaService = {
    aIExtractionLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extract', () => {
    it('should return extracted data from a description', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              claimant: {
                firstName: { value: 'John', confidence: 'high' },
                lastName: { value: 'Smith', confidence: 'high' },
              },
              claim: {
                incidentDate: { value: '2026-03-15T00:00:00Z', confidence: 'medium' },
                estimatedAmount: { value: 5000, confidence: 'low' },
              },
              details: {},
              overallConfidence: 0.75,
            }),
          },
        }],
      };

      const openaiInstance = (service as any).openai;
      openaiInstance.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.extract({
        description: 'John Smith had a car accident on March 15th. Estimated damage around $5000.',
        claimType: ClaimType.AUTO,
      });

      expect(result.claimant.firstName).toBeDefined();
      expect(result.overallConfidence).toBeGreaterThan(0);
    });
  });

  describe('validate', () => {
    it('should return validation issues', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              issues: [
                { type: 'WARNING', field: 'estimatedAmount', message: 'Amount seems unusually high for this claim type' },
              ],
              summary: 'One warning found. Review estimated amount.',
            }),
          },
        }],
      };

      const openaiInstance = (service as any).openai;
      openaiInstance.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.validate({
        claim: {
          type: ClaimType.AUTO,
          description: 'Car accident',
          incidentDate: '2026-03-15T00:00:00Z',
          estimatedAmount: 500000,
        },
        claimant: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          phone: '555-0100',
          address: '123 Main St',
          policyNumber: 'POL-12345',
        },
      });

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('WARNING');
    });
  });
});
