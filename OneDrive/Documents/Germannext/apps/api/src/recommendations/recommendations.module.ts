import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AgentEventsModule } from '../agent-events/agent-events.module';
import { QualificationModule } from '../qualification/qualification.module';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [DatabaseModule, AgentEventsModule, QualificationModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
