import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentService } from '../../payment/payment.service';

/**
 * Server-side Guard: Ensures the authenticated user holds an active, unexpired Educaro Premium plan.
 * Never trusts frontend flags.
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly paymentService: PaymentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required to access premium features.');
    }

    const premiumStatus = await this.paymentService.getPremiumStatus(user.id);

    if (!premiumStatus.isActive) {
      if (premiumStatus.state === 'SUBMITTED') {
        throw new ForbiddenException(
          'Your Educaro Premium payment is submitted and awaiting confirmation. Premium features will unlock upon verification.',
        );
      } else if (premiumStatus.state === 'EXPIRED') {
        throw new ForbiddenException(
          `Your Educaro Premium access expired on ${new Date(
            premiumStatus.accessExpiryDate!,
          ).toLocaleDateString()}. Please renew to continue accessing premium features.`,
        );
      } else {
        throw new ForbiddenException(
          'Educaro Premium access is required to use this service. Please complete checkout to unlock 90 days of access.',
        );
      }
    }

    return true;
  }
}
