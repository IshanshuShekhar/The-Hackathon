import { PaymentMethod, PaymentStatus } from '../enums/payment.enum';

export interface VerificationPackage {
  id: string;
  name: string;
  priceInr: number;
  scope: string[];
  turnaroundHours: number;
  recommended?: boolean;
}

export interface PaymentOrder {
  id: string;
  applicantId: string;
  packageId: string;
  method: PaymentMethod;
  orderRef: string;
  amount: number;
  uniqueAmount?: number;
  currency: string;
  upiUri: string;
  qrPngBase64?: string;
  status: PaymentStatus;
  utr?: string;
  screenshotKey?: string;
  paidAtClaimed?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectReason?: string;
  expiresAt: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface CreatePaymentOrderDto {
  packageId: string;
  method?: PaymentMethod;
}

export interface SubmitUtrDto {
  utr: string;
  screenshotKey?: string;
  paidAtClaimed?: string;
}

export type PremiumAccessState = 'NONE' | 'SUBMITTED' | 'ACTIVE' | 'EXPIRED';

export interface PurchaseRecord {
  id: string;
  userId: string;
  paymentId: string;
  amount: number;
  currency: string;
  purchaseDate?: string | null;
  accessExpiryDate?: string | null;
  status: 'SUBMITTED' | 'CONFIRMED' | 'EXPIRED';
  plan: string;
  receiptFileUrl?: string | null;
  receiptOriginalFilename?: string | null;
  receiptMimeType?: string | null;
  receiptSizeBytes?: number | null;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PremiumStatusResponse {
  state: PremiumAccessState;
  isActive: boolean;
  daysRemaining: number;
  purchaseDate?: string | null;
  accessExpiryDate?: string | null;
  latestPurchase?: PurchaseRecord | null;
  perks: string[];
}

export interface CheckoutPlanInfo {
  planName: string;
  amount: number;
  currency: string;
  validityDays: number;
  upiId: string;
  upiUri: string;
  qrCodeDataUrl: string;
  perks: string[];
}

