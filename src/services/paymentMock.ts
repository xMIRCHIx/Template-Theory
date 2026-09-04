import { CartItem, OrderDetails } from '../types';

export const processMockCheckout = async (
  customerEmail: string,
  customerName: string,
  items: CartItem[],
  subtotal: number,
  discount = 0
): Promise<OrderDetails> => {
  // Simulate network latency (400ms)
  await new Promise((resolve) => setTimeout(resolve, 400));

  const orderId = 'TT-' + Math.floor(100000 + Math.random() * 900000);
  const downloadTokens: Record<string, string> = {};

  items.forEach((item) => {
    // Generate secure simulated one-time download token
    downloadTokens[item.product.id] = `tok_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  });

  const order: OrderDetails = {
    orderId,
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    customerEmail,
    customerName,
    items,
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    downloadTokens,
  };

  // Save latest order in session storage
  try {
    sessionStorage.setItem('templatetheory_last_order', JSON.stringify(order));
  } catch (e) {
    console.error('Failed to store order in sessionStorage', e);
  }

  return order;
};

export const getLastOrder = (): OrderDetails | null => {
  try {
    const saved = sessionStorage.getItem('templatetheory_last_order');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};
