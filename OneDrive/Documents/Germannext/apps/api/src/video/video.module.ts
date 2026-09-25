import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { DatabaseModule } from '../database/database.module';
import { AgentEventsModule } from '../agent-events/agent-events.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [DatabaseModule, AgentEventsModule, ProfileModule],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
