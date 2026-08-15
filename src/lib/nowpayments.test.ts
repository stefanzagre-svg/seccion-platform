import { describe, it, expect } from 'vitest';
import { NOWPaymentsService } from './nowpayments';

describe('NOWPayments Crypto Service', () => {
  const service = new NOWPaymentsService();

  it('calculates 90% founding creator revenue split correctly', () => {
    const grossAmount = 100; // $100 subscription
    const split = service.calculateCryptoSplit(grossAmount, true);

    expect(split.grossAmount).toBe(100);
    expect(split.processorFee).toBe(0.50); // 0.5% network fee
    expect(split.netRevenue).toBe(99.50);
    expect(split.creatorShare).toBe(89.55); // 90% of $99.50
    expect(split.platformShare).toBe(9.95);  // 10% of $99.50
  });

  it('calculates 80% standard creator revenue split correctly', () => {
    const grossAmount = 50;
    const split = service.calculateCryptoSplit(grossAmount, false);

    expect(split.grossAmount).toBe(50);
    expect(split.processorFee).toBe(0.25); // 0.5%
    expect(split.netRevenue).toBe(49.75);
    expect(split.creatorShare).toBe(39.80); // 80% of $49.75
    expect(split.platformShare).toBe(9.95);  // 20% of $49.75
  });

  it('creates mock invoice when in sandbox/demo mode', async () => {
    const invoice = await service.createInvoice({
      priceAmount: 25,
      priceCurrency: 'usd',
      payCurrency: 'usdttrc20',
      orderId: 'test_order_123',
      orderDescription: 'Test VIP Sub',
    });

    expect(invoice.id).toBeDefined();
    expect(invoice.invoice_url).toContain('https://nowpayments.io/payment/?iid=');
    expect(invoice.price_amount).toBe('25');
    expect(invoice.pay_currency).toBe('usdttrc20');
  });
});
