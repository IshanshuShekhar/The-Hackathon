import { Controller, Get, Query, Param } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async getAllFaqs() {
    return this.faqService.getAllFaqs();
  }

  @Get('search')
  async searchFaqs(@Query('q') query: string) {
    if (!query) return [];
    return this.faqService.searchFaqs(query);
  }

  @Get('for-screen/:key')
  async getFaqsForScreen(@Param('key') key: string) {
    return this.faqService.getFaqsForScreen(key);
  }
}
