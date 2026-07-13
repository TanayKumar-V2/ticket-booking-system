import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentsService {
  private razorpay: any;
  private readonly keyId = process.env.RAZORPAY_KEY_ID || 'mock_key_id';
  private readonly keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret';

  constructor() {
    // Note: If using mock keys, we don't actually want to call Razorpay APIs and fail.
    // In a real env, we'd initialize the real Razorpay instance.
    try {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    } catch (e) {
      console.warn('Razorpay SDK failed to initialize. Ensure valid keys are provided.');
    }
  }

  async createOrder(amountInCents: number, receipt: string) {
    if (this.keyId.startsWith('mock_')) {
      // Return a mock order if no real keys
      return {
        id: `order_mock_${Date.now()}`,
        amount: amountInCents,
        currency: 'USD',
        receipt,
      };
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: amountInCents,
        currency: 'USD',
        receipt,
        payment_capture: 1, // Auto capture
      });
      return order;
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || 'Failed to create payment order');
    }
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (this.keySecret.startsWith('mock_')) {
      // In mock mode, just assume valid
      return true;
    }

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body.toString())
      .digest('hex');
      
    return expectedSignature === signature;
  }
}
