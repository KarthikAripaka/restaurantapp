const STATUS_CONFIG = {
  ready:             { label: 'Ready for Pickup', classes: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  out_for_delivery:  { label: 'Out for Delivery',  classes: 'bg-brand-50 text-brand-700 border-brand-200', dot: 'bg-brand-500 animate-pulse' },
  delivered:         { label: 'Delivered',         classes: 'bg-ink-100 text-ink-600 border-ink-200',     dot: 'bg-ink-400' },
  cancelled:         { label: 'Cancelled',         classes: 'bg-red-50 text-red-700 border-red-200',      dot: 'bg-red-500' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ready;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold text-xs ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
