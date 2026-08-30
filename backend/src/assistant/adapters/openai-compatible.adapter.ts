import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILlmProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAiCompatibleAdapter implements ILlmProvider {
  private readonly logger = new Logger(OpenAiCompatibleAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async generateStructuredResponse<T>(
    systemPrompt: string,
    userPrompt: string,
    jsonSchema?: object,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>('AI_BASE_URL') || 'https://api.openai.com/v1';
    const apiKey = this.configService.get<string>('AI_API_KEY') || '';
    const model = this.configService.get<string>('AI_MODEL') || 'llama-3.1-8b-instant';
    const temperature = parseFloat(this.configService.get<string>('AI_TEMPERATURE') || '0.2');

    const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

    const body: any = {
      model,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    };

    if (jsonSchema) {
      body.response_format = { type: 'json_object' };
    }

    const maxRetries = 2;
    const timeoutMs = 8000;

    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(id);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`LLM provider error (${response.status}): ${errorText}`);
        }

        const data: any = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('No content returned from LLM provider.');
        }

        return JSON.parse(content.trim()) as T;
      } catch (error: any) {
        clearTimeout(id);
        this.logger.warn(
          `Attempt ${attempt} failed: ${error.message || error}.`,
        );
        if (attempt >= maxRetries) {
          throw new Error(`Failed to generate structured response after ${maxRetries} attempts: ${error.message || error}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Unexpected LLM adapter failure');
  }
}
