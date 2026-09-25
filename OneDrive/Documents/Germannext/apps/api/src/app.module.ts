import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AgentEventsModule } from './agent-events/agent-events.module';
import { IntakeModule } from './intake/intake.module';
import { ExtractionModule } from './extraction/extraction.module';
import { ConsistencyModule } from './consistency/consistency.module';
import { QualificationModule } from './qualification/qualification.module';
import { CvModule } from './cv/cv.module';
import { PaymentModule } from './payment/payment.module';
import { VideoModule } from './video/video.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { FaqModule } from './faq/faq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AgentEventsModule,
    AuthModule,
    ProfileModule,
    IntakeModule,
    ExtractionModule,
    ConsistencyModule,
    QualificationModule,
    CvModule,
    PaymentModule,
    VideoModule,
    RecommendationsModule,
    OrchestratorModule,
    KnowledgeModule,
    FaqModule,
    HealthModule,
  ],
})
export class AppModule {}
