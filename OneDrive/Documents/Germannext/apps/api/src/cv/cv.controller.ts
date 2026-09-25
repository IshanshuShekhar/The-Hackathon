import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { CvService } from './cv.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @UseGuards(JwtAuthGuard)
  @Get('generate')
  async generate(@Req() req: Request & { user: any }) {
    return this.cvService.generateCV(req.user.id);
  }

  @Get('demo-generate')
  async demoGenerate(@Req() req: Request) {
    const userId = (req.query.userId as string) || 'demo-user';
    return this.cvService.generateCV(userId);
  }
}
