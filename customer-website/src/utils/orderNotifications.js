// Tracks which order statuses the customer has already been notified about,
// so we don't re-alert them about the same cancellation on every visit.
// No customer accounts exist yet, so this lives in localStorage keyed by Order ID.

const SEEN_KEY = 'dfc_seen_order_status';

export const getSeenStatuses = () => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
  } catch {
    return {};
  }
};

export const markOrderStatusSeen = (orderId, status) => {
  const seen = getSeenStatuses();
  seen[orderId] = status;
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    /* storage full or unavailable — fail silently */
  }
};

// True when this order is cancelled and the customer hasn't acknowledged that yet.
export const isUnseenCancellation = (order) => {
  if (!order || order.status !== 'cancelled') return false;
  const seen = getSeenStatuses();
  return seen[order.orderId] !== 'cancelled';
};
