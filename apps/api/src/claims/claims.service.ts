import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto, UpdateClaimDto, ClaimantDto, ClaimDetailsDto } from '@claims-assistant/shared';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  private async generateClaimNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.claim.count();
    const seq = String(count + 1).padStart(5, '0');
    return `CLM-${year}-${seq}`;
  }

  async create(dto: CreateClaimDto) {
    const claimNumber = await this.generateClaimNumber();
    return this.prisma.claim.create({
      data: {
        claimNumber,
        type: dto.type,
        description: dto.description,
        incidentDate: dto.incidentDate ? new Date(dto.incidentDate) : null,
        estimatedAmount: dto.estimatedAmount ?? null,
        priority: dto.priority,
        createdBy: dto.createdBy,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [claims, total] = await Promise.all([
      this.prisma.claim.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { claimant: true },
      }),
      this.prisma.claim.count(),
    ]);
    return { claims, total, page, limit };
  }

  async findOne(id: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        claimant: true,
        claimDetails: true,
        documents: true,
      },
    });
    if (!claim) throw new NotFoundException(`Claim ${id} not found`);
    return claim;
  }

  async update(id: string, dto: UpdateClaimDto) {
    await this.findOne(id);
    return this.prisma.claim.update({
      where: { id },
      data: {
        ...dto,
        incidentDate: dto.incidentDate ? new Date(dto.incidentDate) : undefined,
      },
      include: { claimant: true, claimDetails: true },
    });
  }

  async updateClaimant(claimId: string, dto: ClaimantDto) {
    await this.findOne(claimId);
    return this.prisma.claimant.upsert({
      where: { claimId },
      create: { claimId, ...dto },
      update: dto,
    });
  }

  async updateClaimDetails(claimId: string, dto: ClaimDetailsDto) {
    await this.findOne(claimId);
    return this.prisma.claimDetails.upsert({
      where: { claimId },
      create: { claimId, detailType: dto.detailType, data: dto.data as any },
      update: { detailType: dto.detailType, data: dto.data as any },
    });
  }

  async submit(id: string) {
    const claim = await this.findOne(id);
    if (claim.status !== 'DRAFT') {
      throw new Error(`Claim ${id} is not in DRAFT status`);
    }
    return this.prisma.claim.update({
      where: { id },
      data: { status: 'SUBMITTED' },
      include: { claimant: true, claimDetails: true, documents: true },
    });
  }
}
