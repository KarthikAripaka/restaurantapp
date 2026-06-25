/**
 * Generates a human-readable order ID.
 * Format: DFC-YYYYMMDD-XXXX (e.g. DFC-20241215-4827)
 * Unique enough for a single restaurant; includes date for easy filtering.
 */
const generateOrderId = () => {
  const now = new Date();
  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `DFC-${date}-${random}`;
};

module.exports = generateOrderId;
