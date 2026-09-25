import { Module } from '@nestjs/common';
import { ConsistencyController } from './consistency.controller';
import { ConsistencyService } from './consistency.service';
import { DatabaseModule } from '../database/database.module';
import { AgentEventsModule } from '../agent-events/agent-events.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [DatabaseModule, AgentEventsModule, ProfileModule],
  controllers: [ConsistencyController],
  providers: [ConsistencyService],
  exports: [ConsistencyService],
})
export class ConsistencyModule {}
