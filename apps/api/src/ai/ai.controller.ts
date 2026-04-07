import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { AiService } from './ai.service';
import { aiExtractRequestSchema, aiValidateRequestSchema, chatRequestSchema } from '@claims-assistant/shared';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract')
  @HttpCode(HttpStatus.OK)
  async extract(@Body() body: any) {
    const dto = aiExtractRequestSchema.parse(body);
    try {
      return await this.aiService.extract(dto);
    } catch {
      throw new HttpException(
        'AI extraction is currently unavailable. Please fill the form manually.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() body: any) {
    const dto = aiValidateRequestSchema.parse(body);
    try {
      return await this.aiService.validate(dto);
    } catch {
      throw new HttpException(
        'AI validation is currently unavailable. You may submit without validation.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: any) {
    const dto = chatRequestSchema.parse(body);
    try {
      return await this.aiService.chat(dto);
    } catch {
      throw new HttpException(
        'AI chat is currently unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
