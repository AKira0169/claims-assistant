import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimsService } from '../claims/claims.service';

function mapClaimSummary(c: any) {
  return {
    id: c.id,
    claimNumber: c.claimNumber,
    type: c.type,
    status: c.status,
    priority: c.priority,
    claimantName: c.claimant
      ? `${c.claimant.firstName} ${c.claimant.lastName}`
      : null,
  };
}

@Injectable()
export class ChatToolsService {
  private readonly logger = new Logger(ChatToolsService.name);

  constructor(
    private prisma: PrismaService,
    private claimsService: ClaimsService,
  ) {}

  async searchClaims(params: {
    status?: string;
    type?: string;
    priority?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    try {
      const result = await this.claimsService.findAll({
        status: params.status,
        type: params.type,
        priority: params.priority,
        search: params.search,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        limit: Math.min(params.limit || 10, 20),
      });

      return result.data.map((c) => ({
        ...mapClaimSummary(c),
        incidentDate: c.incidentDate?.toISOString() ?? null,
        estimatedAmount: c.estimatedAmount,
      }));
    } catch (error) {
      this.logger.error('searchClaims failed', error);
      return { error: 'Failed to search claims' };
    }
  }

  async getClaimById(identifier: string) {
    try {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          identifier,
        );

      const claim = isUuid
        ? await this.prisma.claim.findUnique({
            where: { id: identifier },
            include: {
              claimant: true,
              claimDetails: true,
              documents: true,
              aiLogs: true,
            },
          })
        : await this.prisma.claim.findFirst({
            where: { claimNumber: identifier },
            include: {
              claimant: true,
              claimDetails: true,
              documents: true,
              aiLogs: true,
            },
          });

      if (!claim) return { error: `Claim '${identifier}' not found` };
      return claim;
    } catch (error) {
      this.logger.error('getClaimById failed', error);
      return { error: 'Failed to retrieve claim' };
    }
  }

  async getClaimStats(groupBy: 'status' | 'type' | 'priority') {
    try {
      const results = await this.prisma.claim.groupBy({
        by: [groupBy],
        _count: { id: true },
        _sum: { estimatedAmount: true },
      });

      return results.map((r) => ({
        group: r[groupBy],
        count: r._count.id,
        totalAmount: r._sum.estimatedAmount ?? 0,
      }));
    } catch (error) {
      this.logger.error('getClaimStats failed', error);
      return { error: 'Failed to get claim statistics' };
    }
  }

  async getRecentActivity(limit?: number) {
    try {
      const take = Math.min(limit || 10, 20);
      const claims = await this.prisma.claim.findMany({
        take,
        orderBy: { updatedAt: 'desc' },
        include: { claimant: true },
      });

      return claims.map((c) => ({
        ...mapClaimSummary(c),
        updatedAt: c.updatedAt.toISOString(),
      }));
    } catch (error) {
      this.logger.error('getRecentActivity failed', error);
      return { error: 'Failed to get recent activity' };
    }
  }
}

export const CHAT_TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'searchClaims',
      description:
        'Search and filter claims by status, type, priority, text search, and date range. Returns a list of claim summaries.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description:
              'Filter by claim status: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, or REJECTED',
          },
          type: {
            type: 'string',
            description: 'Filter by claim type: AUTO, PROPERTY, HEALTH, or OTHER',
          },
          priority: {
            type: 'string',
            description: 'Filter by priority: LOW, MEDIUM, HIGH, or URGENT',
          },
          search: {
            type: 'string',
            description:
              'Text search across claim number, description, and claimant name',
          },
          dateFrom: {
            type: 'string',
            description: 'Start of incident date range (ISO date string)',
          },
          dateTo: {
            type: 'string',
            description: 'End of incident date range (ISO date string)',
          },
          limit: {
            type: 'number',
            description: 'Max results to return (default 10, max 20)',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getClaimById',
      description:
        'Get full details of a specific claim by its UUID or claim number (e.g., CLM-2026-00001). Returns claimant info, claim details, documents, and AI extraction logs.',
      parameters: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string',
            description: 'The claim UUID or claim number (e.g., CLM-2026-00001)',
          },
        },
        required: ['identifier'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getClaimStats',
      description:
        'Get aggregate statistics about claims grouped by a field. Returns count and total estimated amount per group.',
      parameters: {
        type: 'object',
        properties: {
          groupBy: {
            type: 'string',
            enum: ['status', 'type', 'priority'],
            description: 'Field to group statistics by',
          },
        },
        required: ['groupBy'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getRecentActivity',
      description:
        'Get the most recently updated claims. Useful for seeing latest activity.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of recent claims to return (default 10, max 20)',
          },
        },
      },
    },
  },
];
