import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { CommandDto } from './dto/command.dto';
import { AssistantResponse } from './interfaces/assistant-response.interface';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('command')
  @HttpCode(HttpStatus.OK)
  async handleCommand(@Body() commandDto: CommandDto): Promise<AssistantResponse> {
    return this.assistantService.processCommand(commandDto.message);
  }
}
