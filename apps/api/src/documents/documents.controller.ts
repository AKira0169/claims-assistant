import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

@Controller('claims/:claimId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(
    @Param('claimId') claimId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.upload(claimId, file);
  }

  @Get()
  async findByClaimId(@Param('claimId') claimId: string) {
    return this.documentsService.findByClaimId(claimId);
  }
}
