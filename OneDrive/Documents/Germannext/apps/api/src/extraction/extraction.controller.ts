import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ExtractionService, DocumentUploadDto } from './extraction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('extraction')
export class ExtractionController {
  constructor(private readonly extractionService: ExtractionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  async uploadDocument(
    @Req() req: Request & { user: any },
    @Body() body: Omit<DocumentUploadDto, 'userId'>,
  ) {
    return this.extractionService.processDocumentExtraction({
      userId: req.user.id,
      ...body,
    });
  }

  @Post('demo-upload')
  async demoUploadDocument(@Body() dto: DocumentUploadDto) {
    return this.extractionService.processDocumentExtraction(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('documents')
  async getDocuments(@Req() req: Request & { user: any }) {
    return this.extractionService.getDocuments(req.user.id);
  }

  @Get('demo-documents')
  async getDemoDocuments(@Req() req: Request) {
    const userId = (req.query.userId as string) || 'demo-user';
    return this.extractionService.getDocuments(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-field')
  async confirmField(
    @Req() req: Request & { user: any },
    @Body() body: { docId: string; fieldKey: string; confirmedValue?: string },
  ) {
    return this.extractionService.confirmExtractedField(
      req.user.id,
      body.docId,
      body.fieldKey,
      body.confirmedValue,
    );
  }
}
