import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ConsistencyService } from './consistency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ResolveInconsistencyDto } from '@educaro/shared';

@Controller('consistency')
export class ConsistencyController {
  constructor(private readonly consistencyService: ConsistencyService) {}

  @UseGuards(JwtAuthGuard)
  @Get('check')
  async check(@Req() req: Request & { user: any }) {
    return this.consistencyService.checkInconsistencies(req.user.id);
  }

  @Get('demo-check')
  async demoCheck(@Req() req: Request) {
    const userId = (req.query.userId as string) || 'demo-user';
    return this.consistencyService.checkInconsistencies(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resolve')
  async resolve(
    @Req() req: Request & { user: any },
    @Body() dto: ResolveInconsistencyDto,
  ) {
    return this.consistencyService.resolveInconsistency(req.user.id, dto);
  }

  @Post('demo-resolve')
  async demoResolve(@Body() dto: ResolveInconsistencyDto & { userId: string }) {
    return this.consistencyService.resolveInconsistency(dto.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('inject-demo-conflict')
  async injectConflict(@Req() req: Request & { user: any }) {
    return this.consistencyService.injectDemoConflict(req.user.id);
  }

  @Post('demo-inject-conflict')
  async demoInjectConflict(@Body('userId') userId: string = 'demo-user') {
    return this.consistencyService.injectDemoConflict(userId);
  }
}
