import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import {
  CreateClaimDto,
  UpdateClaimDto,
  ClaimantDto,
  ClaimDetailsDto,
  createClaimSchema,
  updateClaimSchema,
  claimantSchema,
  claimDetailsSchema,
} from '@claims-assistant/shared';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  async create(@Body() body: any) {
    const dto: CreateClaimDto = createClaimSchema.parse(body);
    return this.claimsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.claimsService.findAll(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.claimsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const dto: UpdateClaimDto = updateClaimSchema.parse(body);
    return this.claimsService.update(id, dto);
  }

  @Patch(':id/claimant')
  async updateClaimant(@Param('id') id: string, @Body() body: any) {
    const dto: ClaimantDto = claimantSchema.parse(body);
    return this.claimsService.updateClaimant(id, dto);
  }

  @Patch(':id/details')
  async updateDetails(@Param('id') id: string, @Body() body: any) {
    const dto: ClaimDetailsDto = claimDetailsSchema.parse(body);
    return this.claimsService.updateClaimDetails(id, dto);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    return this.claimsService.submit(id);
  }
}
