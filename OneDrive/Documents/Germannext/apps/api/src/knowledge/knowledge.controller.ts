import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { KnowledgeService, KnowledgeEntry } from './knowledge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@educaro/shared';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  async getKnowledge() {
    return this.knowledgeService.getKnowledgeBase();
  }

  // PRD Section 19.6 (C5 - admin-editable rules)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async updateKnowledge(@Body() entries: KnowledgeEntry[]) {
    return this.knowledgeService.updateKnowledgeBase(entries);
  }
}
