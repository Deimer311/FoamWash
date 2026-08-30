import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { OpenAiCompatibleAdapter } from './adapters/openai-compatible.adapter';

@Module({
  controllers: [AssistantController],
  providers: [
    AssistantService,
    {
      provide: 'ILlmProvider',
      useClass: OpenAiCompatibleAdapter,
    },
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
