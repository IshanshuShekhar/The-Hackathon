import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { IntakeService, IntakeMessageDto } from './intake.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('intake')
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('message')
  async handleMessage(
    @Req() req: Request & { user: any },
    @Body() body: Omit<IntakeMessageDto, 'userId'>,
  ) {
    return this.intakeService.processIntakeMessage({
      userId: req.user.id,
      ...body,
    });
  }

  // Unauthenticated/demo route for seamless demo transitions
  @Post('demo-message')
  async handleDemoMessage(@Body() dto: IntakeMessageDto) {
    return this.intakeService.processIntakeMessage(dto);
  }
}
