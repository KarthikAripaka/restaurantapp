import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Navigation, PackageCheck, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LocationMap from './LocationMap';
import useRiderOrdersStore from '../../store/riderOrdersStore';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const RiderOrderCard = ({ order, isNew = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { startDelivery, finishOrder, acknowledgeNew } = useRiderOrdersStore();

  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true });
  const hasLocation = order.customer?.location?.lat != null && order.customer?.location?.lng != null;
  const destination = hasLocation
    ? [order.customer.location.lat, order.customer.location.lng]
    : null;
  // Turn-by-turn directions deep link — uses the pinned coordinates when available
  // (far more accurate than a typed address), falling back to an address text search.
  const mapsUrl = hasLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${destination[0]},${destination[1]}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        order.customer.address + (order.customer.landmark ? ', ' + order.customer.landmark : '')
      )}`;

  const handleStart = async () => {
    setIsUpdating(true);
    const result = await startDelivery(order._id);
    setIsUpdating(false);
    if (result.success) {
      toast.success('Delivery started — drive safe! 🛵');
    } else {
      toast.error(result.message || 'Could not start delivery');
    }
  };

  const handleFinish = async () => {
    setIsUpdating(true);
    const result = await finishOrder(order._id);
    setIsUpdating(false);
    if (result.success) {
      toast.success('Order delivered! Great job 🎉');
    } else {
      toast.error(result.message || 'Could not finish order');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onAnimationComplete={() => isNew && acknowledgeNew(order._id)}
      className={`card p-4 space-y-3 ${isNew ? 'border-brand-300 ring-1 ring-brand-200' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-ink-900 font-mono text-sm">{order.orderId}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-ink-400 mt-1 flex items-center gap-1">
            <Clock size={11} /> {timeAgo}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-ink-900">₹{order.total}</p>
          <p className="text-xs text-ink-400">{order.paymentMethod === 'cod' ? 'Cash on delivery' : ''}</p>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-cream-100 rounded-lg p-3 space-y-2">
        <p className="font-semibold text-ink-900 text-sm">{order.customer.name}</p>
        <p className="flex items-start gap-2 text-sm text-ink-600">
          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
          <span>{order.customer.address}{order.customer.landmark ? ` · ${order.customer.landmark}` : ''}</span>
        </p>
        {order.customer.notes && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            📝 {order.customer.notes}
          </p>
        )}

        {/* Call + Navigate row — large thumb-friendly tap targets */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a href={`tel:${order.customer.phone}`}
            className="flex items-center justify-center gap-2 bg-white border border-ink-900/[0.1] hover:bg-cream-50 text-ink-900 text-sm font-semibold py-2.5 rounded-lg transition-colors active:scale-95">
            <Phone size={15} /> Call
          </a>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white border border-ink-900/[0.1] hover:bg-cream-50 text-ink-900 text-sm font-semibold py-2.5 rounded-lg transition-colors active:scale-95">
            <Navigation size={15} /> Navigate
          </a>
        </div>

        {hasLocation && <LocationMap destination={destination} />}
      </div>

      {/* Items summary */}
      <p className="text-xs text-ink-400">
        {order.items.length} item{order.items.length > 1 ? 's' : ''} · {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
      </p>

      {/* Main action */}
      {order.status === 'ready' && (
        <button onClick={handleStart} disabled={isUpdating} className="btn-tap btn-primary">
          <PackageCheck size={19} />
          {isUpdating ? 'Starting...' : 'Start Delivery'}
        </button>
      )}

      {order.status === 'out_for_delivery' && (
        <button onClick={handleFinish} disabled={isUpdating} className="btn-tap btn-success">
          <CheckCircle2 size={19} />
          {isUpdating ? 'Finishing...' : 'Finish Order'}
        </button>
      )}
    </motion.div>
  );
};

export default RiderOrderCard;
