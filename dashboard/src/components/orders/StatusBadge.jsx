const STATUS_CONFIG = {
  pending:   { label: 'Pending',   classes: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', classes: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500' },
  preparing: { label: 'Preparing', classes: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500 animate-pulse' },
  ready:     { label: 'Ready',     classes: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  out_for_delivery: { label: 'Out for Delivery', classes: 'bg-brand-50 text-brand-700 border-brand-200', dot: 'bg-brand-500 animate-pulse' },
  delivered: { label: 'Delivered', classes: 'bg-ink-100 text-ink-600 border-ink-200',       dot: 'bg-ink-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500' },
};

const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold ${textSize} ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
export { STATUS_CONFIG };
