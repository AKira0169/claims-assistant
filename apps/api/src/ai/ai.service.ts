import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { ChatToolsService, CHAT_TOOL_DEFINITIONS } from './chat-tools.service';
import {
  AiExtractRequest,
  AiExtractionResponse,
  AiValidateRequest,
  AiValidationResponse,
  ChatRequest,
  aiExtractionResponseSchema,
  aiValidationResponseSchema,
} from '@claims-assistant/shared';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private readonly model = 'gpt-4o';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private chatTools: ChatToolsService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async extract(request: AiExtractRequest): Promise<AiExtractionResponse> {
    const systemPrompt = `You are a claims data extraction specialist for an insurance company.
Given a free-text incident description and claim type, extract structured data.
For each field you extract, assign a confidence level: "high", "medium", or "low".
If you cannot determine a field, omit it entirely.
Respond with valid JSON matching this structure:
{
  "claimant": {
    "firstName": { "value": "string", "confidence": "high|medium|low" },
    "lastName": { "value": "string", "confidence": "high|medium|low" },
    "email": { "value": "string", "confidence": "high|medium|low" },
    "phone": { "value": "string", "confidence": "high|medium|low" },
    "address": { "value": "string", "confidence": "high|medium|low" },
    "policyNumber": { "value": "string", "confidence": "high|medium|low" }
  },
  "claim": {
    "incidentDate": { "value": "ISO datetime string", "confidence": "high|medium|low" },
    "estimatedAmount": { "value": number, "confidence": "high|medium|low" },
    "priority": { "value": "LOW|MEDIUM|HIGH|URGENT", "confidence": "high|medium|low" }
  },
  "details": {
    "fieldName": { "value": "any", "confidence": "high|medium|low" }
  },
  "overallConfidence": 0.0 to 1.0
}
Only include fields you can extract. The claim type is: ${request.claimType}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.description },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty response from OpenAI');

      const parsed = JSON.parse(content);
      const validated = aiExtractionResponseSchema.parse(parsed);

      await this.prisma.aIExtractionLog.create({
        data: {
          inputText: request.description,
          extractedData: validated as any,
          confidence: validated.overallConfidence,
          model: this.model,
        },
      });

      return validated;
    } catch (error) {
      this.logger.error('AI extraction failed', error);
      throw error;
    }
  }

  async validate(request: AiValidateRequest): Promise<AiValidationResponse> {
    const systemPrompt = `You are a claims validation specialist for an insurance company.
Review the submitted claim data for completeness and anomalies.
Check for:
- Missing required fields (firstName, lastName, policyNumber, description, claim type)
- Logical inconsistencies (incident date in the future, claim type doesn't match details)
- Unusual amounts (extremely high or low for the claim type)
- Potential duplicate indicators
For each issue, classify as "WARNING" (can override) or "ERROR" (must fix).
Respond with valid JSON:
{
  "issues": [
    { "type": "WARNING" or "ERROR", "field": "fieldPath", "message": "human-readable explanation" }
  ],
  "summary": "brief overall assessment"
}
If everything looks good, return empty issues array with a positive summary.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(request, null, 2) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty response from OpenAI');

      const parsed = JSON.parse(content);
      return aiValidationResponseSchema.parse(parsed);
    } catch (error) {
      this.logger.error('AI validation failed', error);
      throw error;
    }
  }

  async chat(request: ChatRequest): Promise<{ message: { role: 'assistant'; content: string } }> {
    const systemPrompt = `You are a claims status assistant for internal insurance staff. Your role is to help staff look up, search, and analyze insurance claims data.

Rules:
- Always use the available tools to look up real data before answering. Never fabricate or guess claim data.
- Format numbers readably (e.g., $5,000 not 5000). Format dates in a human-friendly way.
- When referencing claims, always include the claim number (e.g., CLM-2026-00001).
- Be concise and professional. Use bullet points for lists.
- If a search returns no results, say so clearly and suggest alternative searches.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...request.messages,
    ];

    try {
      let iterations = 0;
      const maxIterations = 5;

      while (iterations < maxIterations) {
        iterations++;

        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages,
          tools: CHAT_TOOL_DEFINITIONS,
          temperature: 0.1,
        });

        const choice = completion.choices[0].message;

        if (!choice.tool_calls || choice.tool_calls.length === 0) {
          return {
            message: {
              role: 'assistant',
              content: choice.content || 'I was unable to generate a response. Please try again.',
            },
          };
        }

        messages.push(choice);

        const toolResults = await Promise.all(
          choice.tool_calls
            .filter((tc) => tc.type === 'function')
            .map(async (toolCall) => {
              const args = JSON.parse(toolCall.function.arguments);
              let result: unknown;

              switch (toolCall.function.name) {
                case 'searchClaims':
                  result = await this.chatTools.searchClaims(args);
                  break;
                case 'getClaimById':
                  result = await this.chatTools.getClaimById(args.identifier);
                  break;
                case 'getClaimStats':
                  result = await this.chatTools.getClaimStats(args.groupBy);
                  break;
                case 'getRecentActivity':
                  result = await this.chatTools.getRecentActivity(args.limit);
                  break;
                default:
                  result = { error: `Unknown tool: ${toolCall.function.name}` };
              }

              return {
                role: 'tool' as const,
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              };
            }),
        );

        messages.push(...toolResults);
      }

      return {
        message: {
          role: 'assistant',
          content: 'I reached the maximum number of tool calls. Please try a simpler question.',
        },
      };
    } catch (error) {
      this.logger.error('AI chat failed', error);
      throw error;
    }
  }
}
