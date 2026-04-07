import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChatToolsService } from './chat-tools.service';
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

  const mockChatToolsService = {
    searchClaims: jest.fn(),
    getClaimById: jest.fn(),
    getClaimStats: jest.fn(),
    getRecentActivity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ChatToolsService, useValue: mockChatToolsService },
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

  describe('chat', () => {
    it('should return assistant message for a simple text response', async () => {
      const openaiInstance = (service as any).openai;
      openaiInstance.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'There are 5 claims in the system.',
            tool_calls: undefined,
          },
        }],
      });

      const result = await service.chat({
        messages: [{ role: 'user', content: 'How many claims are there?' }],
      });

      expect(result.message.role).toBe('assistant');
      expect(result.message.content).toBe('There are 5 claims in the system.');
    });

    it('should execute tool calls and return final response', async () => {
      const openaiInstance = (service as any).openai;

      // First call: OpenAI returns tool call
      openaiInstance.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: null,
            tool_calls: [{
              id: 'call_1',
              type: 'function',
              function: {
                name: 'getClaimStats',
                arguments: JSON.stringify({ groupBy: 'status' }),
              },
            }],
          },
        }],
      });

      // Second call: OpenAI returns text response
      openaiInstance.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'There are 3 submitted and 2 draft claims.',
            tool_calls: undefined,
          },
        }],
      });

      mockChatToolsService.getClaimStats.mockResolvedValueOnce([
        { group: 'SUBMITTED', count: 3, totalAmount: 15000 },
        { group: 'DRAFT', count: 2, totalAmount: 8000 },
      ]);

      const result = await service.chat({
        messages: [{ role: 'user', content: 'How many claims by status?' }],
      });

      expect(mockChatToolsService.getClaimStats).toHaveBeenCalledWith('status');
      expect(result.message.content).toBe('There are 3 submitted and 2 draft claims.');
    });

    it('should handle multiple tool calls in one response', async () => {
      const openaiInstance = (service as any).openai;

      openaiInstance.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: null,
            tool_calls: [
              {
                id: 'call_1',
                type: 'function',
                function: {
                  name: 'getClaimStats',
                  arguments: JSON.stringify({ groupBy: 'status' }),
                },
              },
              {
                id: 'call_2',
                type: 'function',
                function: {
                  name: 'getRecentActivity',
                  arguments: JSON.stringify({ limit: 5 }),
                },
              },
            ],
          },
        }],
      });

      openaiInstance.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Here is the summary.',
            tool_calls: undefined,
          },
        }],
      });

      mockChatToolsService.getClaimStats.mockResolvedValueOnce([]);
      mockChatToolsService.getRecentActivity.mockResolvedValueOnce([]);

      const result = await service.chat({
        messages: [{ role: 'user', content: 'Overview please' }],
      });

      expect(mockChatToolsService.getClaimStats).toHaveBeenCalled();
      expect(mockChatToolsService.getRecentActivity).toHaveBeenCalled();
      expect(result.message.content).toBe('Here is the summary.');
    });

    it('should throw on OpenAI error', async () => {
      const openaiInstance = (service as any).openai;
      openaiInstance.chat.completions.create.mockRejectedValueOnce(new Error('API error'));

      await expect(
        service.chat({ messages: [{ role: 'user', content: 'test' }] }),
      ).rejects.toThrow('API error');
    });
  });
});
