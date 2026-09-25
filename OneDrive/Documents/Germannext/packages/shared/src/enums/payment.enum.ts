/**
 * PRD Section 22: Direct UPI / QR Payments
 * Direct UPI to Educaro business UPI ID. No gateway or webhooks.
 */
export enum PaymentStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  UTR_SUBMITTED = 'UTR_SUBMITTED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  UPI_QR = 'UPI_QR',
  UPI_INTENT = 'UPI_INTENT',
}

export enum PaymentEventType {
  CREATED = 'CREATED',
  UTR_SUBMITTED = 'UTR_SUBMITTED',
  AI_CHECKED = 'AI_CHECKED',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
  STATEMENT_MATCHED = 'STATEMENT_MATCHED',
}
