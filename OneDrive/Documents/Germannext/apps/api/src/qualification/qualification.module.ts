import { Module } from '@nestjs/common';
import { QualificationController } from './qualification.controller';
import { QualificationService } from './qualification.service';
import { DatabaseModule } from '../database/database.module';
import { AgentEventsModule } from '../agent-events/agent-events.module';

@Module({
  imports: [DatabaseModule, AgentEventsModule],
  controllers: [QualificationController],
  providers: [QualificationService],
  exports: [QualificationService],
})
export class QualificationModule {}
