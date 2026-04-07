import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatToolsService } from './chat-tools.service';
import { ClaimsModule } from '../claims/claims.module';

@Module({
  imports: [ClaimsModule],
  controllers: [AiController],
  providers: [AiService, ChatToolsService],
  exports: [AiService],
})
export class AiModule {}
