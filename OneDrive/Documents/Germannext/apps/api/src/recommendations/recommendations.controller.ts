import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import {
  RecommendationItem,
  RecommendationStatus,
  GapAnalysisResponse,
  UpdateRecommendationStatusDto,
} from '@educaro/shared';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  /**
   * GET /recommendations
   * Retrieves all active recommendations for the authenticated applicant,
   * sorted deterministically: REQUIRED > IMPORTANT > RECOMMENDED.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getRecommendations(
    @Req() req: Request & { user: any },
  ): Promise<RecommendationItem[]> {
    return this.recommendationsService.getRecommendations(req.user.id);
  }

  /**
   * GET /recommendations/next-best-action
   * Returns the single top-priority pending or in-progress action.
   */
  @UseGuards(JwtAuthGuard)
  @Get('next-best-action')
  async getNextBestAction(
    @Req() req: Request & { user: any },
  ): Promise<RecommendationItem | null> {
    return this.recommendationsService.getNextBestAction(req.user.id);
  }

  /**
   * GET /recommendations/gaps
   * Grouped Gap Analysis: 5-Category Readiness Scores + Grouped Recommendations + Next Best Action.
   */
  @UseGuards(JwtAuthGuard)
  @Get('gaps')
  async getGapAnalysis(
    @Req() req: Request & { user: any },
  ): Promise<GapAnalysisResponse> {
    return this.recommendationsService.getGapAnalysis(req.user.id);
  }

  /**
   * PATCH /recommendations/:id/status
   * Updates recommendation status (pending | in_progress | completed | dismissed).
   * Verifies tenant ownership.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
    @Body() body: UpdateRecommendationStatusDto,
  ): Promise<RecommendationItem> {
    return this.recommendationsService.updateStatus(
      req.user.id,
      id,
      body.status as RecommendationStatus,
    );
  }

  /**
   * POST /recommendations/recompute
   * Forces re-evaluation of qualification engine rules and profile data.
   */
  @UseGuards(JwtAuthGuard)
  @Post('recompute')
  async recompute(
    @Req() req: Request & { user: any },
  ): Promise<RecommendationItem[]> {
    return this.recommendationsService.recomputeRecommendations(req.user.id);
  }

  // --------------------------------------------------------------------------
  // Dev & Demo Fallbacks (consistent with qualification & consistency controllers)
  // --------------------------------------------------------------------------

  @Get('demo-list')
  async demoList(@Req() req: Request): Promise<RecommendationItem[]> {
    const userId = (req.query.userId as string) || 'demo-user';
    return this.recommendationsService.getRecommendations(userId);
  }

  @Get('demo-next-best-action')
  async demoNextBestAction(
    @Req() req: Request,
  ): Promise<RecommendationItem | null> {
    const userId = (req.query.userId as string) || 'demo-user';
    return this.recommendationsService.getNextBestAction(userId);
  }

  @Get('demo-gaps')
  async demoGaps(@Req() req: Request): Promise<GapAnalysisResponse> {
    const userId = (req.query.userId as string) || 'demo-user';
    return this.recommendationsService.getGapAnalysis(userId);
  }

  @Post('demo-recompute')
  async demoRecompute(
    @Body('userId') bodyUserId?: string,
  ): Promise<RecommendationItem[]> {
    const userId = bodyUserId || 'demo-user';
    return this.recommendationsService.recomputeRecommendations(userId);
  }
}
