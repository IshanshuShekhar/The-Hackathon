import { Module, Global } from '@nestjs/common';
import { AgentEventsService } from './agent-events.service';
import { AgentEventsController } from './agent-events.controller';

@Global()
@Module({
  controllers: [AgentEventsController],
  providers: [AgentEventsService],
  exports: [AgentEventsService],
})
export class AgentEventsModule {}
