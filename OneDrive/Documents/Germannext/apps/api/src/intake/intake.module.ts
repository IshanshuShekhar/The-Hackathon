import { Module } from '@nestjs/common';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';
import { ProfileModule } from '../profile/profile.module';
import { AgentEventsModule } from '../agent-events/agent-events.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, ProfileModule, AgentEventsModule],
  controllers: [IntakeController],
  providers: [IntakeService],
  exports: [IntakeService],
})
export class IntakeModule {}
