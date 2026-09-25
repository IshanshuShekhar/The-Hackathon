import { Controller, Get, Query } from '@nestjs/common';
import { AgentEventsService } from './agent-events.service';

@Controller('agent-trace')
export class AgentEventsController {
  constructor(private readonly eventsService: AgentEventsService) {}

  @Get()
  async getEvents(@Query('userId') userId?: string) {
    const events = await this.eventsService.getEvents(userId);
    return {
      success: true,
      count: events.length,
      data: events,
    };
  }
}
