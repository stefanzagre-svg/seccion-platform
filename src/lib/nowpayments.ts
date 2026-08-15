import crypto from 'crypto';

/**
 * NOWPayments Crypto Gateway Client
 * Handles invoice creation, IPN webhook validation, and crypto currency lookups.
 */

export interface CreateInvoiceParams {
  priceAmount: number;         // Amount in fiat (e.g. EUR / USD)
  priceCurrency: string;       // 'usd' | 'eur'
  payCurrency?: string;        // Optional preferred crypto: 'usdttrc20' | 'usdtmatic' | 'btc' | 'eth'
  orderId: string;             // Internal order/subscription ID
  orderDescription: string;    // Description of purchase
  ipnCallbackUrl?: string;     // Webhook URL
  successUrl?: string;
  cancelUrl?: string;
}

export interface NOWPaymentsInvoiceResponse {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: string;
  price_currency: string;
  pay_currency?: string;
  ipn_callback_url: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
}

export interface NOWPaymentsIPNPayload {
  payment_id: number;
  invoice_id: number;
  payment_status: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired';
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  outcome_amount: number;
  outcome_currency: string;
}

const NOWPAYMENTS_API_URL = process.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';

export class NOWPaymentsService {
  private apiKey: string;
  private ipnSecret: string;

  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY || 'demo_api_key';
    this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || 'demo_ipn_secret';
  }

  /**
   * Check API health / status
   */
  async getStatus(): Promise<{ message: string }> {
    if (!process.env.NOWPAYMENTS_API_KEY) {
      return { message: 'NOWPayments in Sandbox/Demo mode' };
    }
    const res = await fetch(`${NOWPAYMENTS_API_URL}/status`, {
      headers: { 'x-api-key': this.apiKey }
    });
    return res.json();
  }

  /**
   * Create a hosted payment invoice
   */
  async createInvoice(params: CreateInvoiceParams): Promise<NOWPaymentsInvoiceResponse> {
    // Sandbox / Mock Mode Fallback when no live API key is configured
    if (!process.env.NOWPAYMENTS_API_KEY || process.env.NOWPAYMENTS_API_KEY === 'demo_api_key') {
      const mockId = 'np_inv_' + Math.random().toString(36).substring(2, 9);
      return {
        id: mockId,
        order_id: params.orderId,
        order_description: params.orderDescription,
        price_amount: String(params.priceAmount),
        price_currency: params.priceCurrency,
        pay_currency: params.payCurrency || 'usdttrc20',
        ipn_callback_url: params.ipnCallbackUrl || '',
        invoice_url: `https://nowpayments.io/payment/?iid=${mockId}`,
        success_url: params.successUrl || '',
        cancel_url: params.cancelUrl || '',
        created_at: new Date().toISOString()
      };
    }

    const res = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        pay_currency: params.payCurrency,
        order_id: params.orderId,
        order_description: params.orderDescription,
        ipn_callback_url: params.ipnCallbackUrl,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create NOWPayments invoice');
    }
    return data;
  }

  /**
   * Verify HMAC-SHA512 signature from NOWPayments IPN webhook
   */
  verifyIPNSignature(rawBody: string, receivedSignature: string): boolean {
    if (!this.ipnSecret || this.ipnSecret === 'demo_ipn_secret') {
      // In demo mode, accept if signature is provided or skip
      return true;
    }

    try {
      const hmac = crypto.createHmac('sha512', this.ipnSecret);
      const calculatedSignature = hmac.update(rawBody).digest('hex');
      return calculatedSignature.toLowerCase() === receivedSignature.toLowerCase();
    } catch (err) {
      console.error('Error verifying IPN signature:', err);
      return false;
    }
  }

  /**
   * Calculate revenue split for crypto payments
   * Net = Gross - Network fee (0.5% standard NOWPayments fee)
   * Split: 90% (Founding Creator) or 80% (Standard Creator)
   */
  calculateCryptoSplit(grossAmount: number, isFoundingCreator: boolean = true): {
    grossAmount: number;
    processorFee: number;
    netRevenue: number;
    creatorShare: number;
    platformShare: number;
  } {
    const feeRate = 0.005; // 0.5% NOWPayments fee
    const processorFee = Math.round(grossAmount * feeRate * 100) / 100;
    const netRevenue = Math.max(0, grossAmount - processorFee);
    
    const creatorRate = isFoundingCreator ? 0.90 : 0.80;
    const creatorShare = Math.round(netRevenue * creatorRate * 100) / 100;
    const platformShare = Math.round((netRevenue - creatorShare) * 100) / 100;

    return {
      grossAmount,
      processorFee,
      netRevenue,
      creatorShare,
      platformShare
    };
  }
}

export const nowPayments = new NOWPaymentsService();
