import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Returns server-configured checkout details: dynamic UPI URI, QR code, and plan details.
   * UPI ID is read securely from server environment.
   */
  @Get('checkout-info')
  async getCheckoutInfo() {
    return this.paymentService.getCheckoutInfo();
  }

  /**
   * Applicant submits manual UPI payment proof (UTR / receipt screenshot).
   * Status is recorded as 'SUBMITTED' (Awaiting Confirmation).
   */
  @UseGuards(JwtAuthGuard)
  @Post('submit')
  @UseInterceptors(FileInterceptor('receipt'))
  async submitPayment(
    @Req() req: Request & { user: any },
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: { utr?: string; paymentId?: string },
  ) {
    return this.paymentService.submitPayment(
      req.user.id,
      { utr: body?.utr, paymentId: body?.paymentId },
      file,
    );
  }

  /**
   * Retrieves active/expired/submitted status of the applicant's Educaro Premium plan.
   * Enforced strictly server-side.
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getPremiumStatus(@Req() req: Request & { user: any }) {
    return this.paymentService.getPremiumStatus(req.user.id);
  }

  /**
   * Admin / Demo Confirmation endpoint:
   * Sets status = 'CONFIRMED', purchase_date = NOW(), access_expiry_date = NOW() + 90 days.
   * Activates full EDUCARO_PREMIUM entitlement against the applicant's account.
   */
  @UseGuards(JwtAuthGuard)
  @Post('confirm/:purchaseId')
  async confirmPurchase(
    @Param('purchaseId') purchaseId: string,
    @Body() body?: { notes?: string },
  ) {
    return this.paymentService.confirmPurchase(purchaseId, body?.notes);
  }

  /**
   * Retrieves purchase records for the logged-in applicant.
   */
  @UseGuards(JwtAuthGuard)
  @Get('purchases')
  async getPurchases(@Req() req: Request & { user: any }) {
    return this.paymentService.getUserPurchases(req.user.id);
  }

  /**
   * Admin / Reviewer endpoint to view all transactions awaiting confirmation.
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/pending')
  async getPendingPurchases() {
    return this.paymentService.getAllPendingPurchases();
  }

  /**
   * Backward-compatibility route for older entitlement checks.
   */
  @UseGuards(JwtAuthGuard)
  @Get('entitlement/:service')
  async checkLegacyEntitlement(@Req() req: Request & { user: any }) {
    const status = await this.paymentService.getPremiumStatus(req.user.id);
    return {
      active: status.isActive,
      service: 'EDUCARO_PREMIUM',
      status: status.state,
      daysRemaining: status.daysRemaining,
      accessExpiryDate: status.accessExpiryDate,
    };
  }
}
