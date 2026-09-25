import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { DatabaseModule } from '../database/database.module';
import { AgentEventsModule } from '../agent-events/agent-events.module';

@Module({
  imports: [DatabaseModule, AgentEventsModule],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService],
})
export class CvModule {}
