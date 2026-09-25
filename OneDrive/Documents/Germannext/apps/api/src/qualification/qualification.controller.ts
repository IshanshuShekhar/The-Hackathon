import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { WhatIfCriteria } from '@educaro/shared';

@Controller('qualification')
export class QualificationController {
  constructor(private readonly qualificationService: QualificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('evaluate')
  async evaluate(@Req() req: Request & { user: any }) {
    return this.qualificationService.evaluateQualification(req.user.id);
  }

  @Get('demo-evaluate')
  async demoEvaluate(@Req() req: Request) {
    const userId = (req.query.userId as string) || 'demo-user';
    return this.qualificationService.evaluateQualification(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('learning-path')
  async getLearningPath(@Req() req: Request & { user: any }) {
    return this.qualificationService.getLearningPath(req.user.id);
  }

  @Get('demo-learning-path')
  async getDemoLearningPath(@Req() req: Request) {
    const userId = (req.query.userId as string) || 'demo-user';
    return this.qualificationService.getLearningPath(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('what-if')
  async simulateWhatIf(
    @Req() req: Request & { user: any },
    @Body() criteria: WhatIfCriteria,
  ) {
    return this.qualificationService.simulateWhatIf(req.user.id, criteria);
  }

  @Post('demo-what-if')
  async demoSimulateWhatIf(
    @Body() body: { criteria: WhatIfCriteria; userId?: string },
  ) {
    return this.qualificationService.simulateWhatIf(body.userId || 'demo-user', body.criteria);
  }
}
