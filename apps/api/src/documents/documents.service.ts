import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async upload(claimId: string, file: Express.Multer.File) {
    const claimDir = path.join(this.uploadsDir, claimId);
    if (!fs.existsSync(claimDir)) {
      fs.mkdirSync(claimDir, { recursive: true });
    }

    const filePath = path.join(claimDir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    return this.prisma.claimDocument.create({
      data: {
        claimId,
        fileName: file.originalname,
        fileType: file.mimetype,
        filePath: `uploads/${claimId}/${file.originalname}`,
      },
    });
  }

  async findByClaimId(claimId: string) {
    return this.prisma.claimDocument.findMany({
      where: { claimId },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}
