import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import useRiderOrdersStore from '../store/riderOrdersStore';
import RiderOrderCard from '../components/orders/RiderOrderCard';

const OrdersPage = () => {
  const { activeOrders, isLoading, fetchActive, newOrderIds } = useRiderOrdersStore();

  useEffect(() => {
    fetchActive();
  }, []);

  // Sort: out_for_delivery first (in progress), then ready (waiting pickup) by assignment time
  const sorted = [...activeOrders].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'out_for_delivery' ? -1 : 1;
  });

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">My Orders</h1>
          <p className="text-ink-500 text-sm">
            {activeOrders.length === 0 ? 'No active deliveries' : `${activeOrders.length} active deliver${activeOrders.length > 1 ? 'ies' : 'y'}`}
          </p>
        </div>
        <button onClick={fetchActive} disabled={isLoading}
          className="p-2.5 bg-white border border-ink-900/[0.08] hover:bg-cream-100 rounded-xl text-ink-700 transition-colors active:scale-95 shadow-soft">
          <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* List */}
      {isLoading && activeOrders.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card p-4 h-44 animate-pulse">
              <div className="h-4 bg-cream-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-cream-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-cream-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-6xl mb-4">🛵</p>
          <p className="text-ink-700 font-medium">No orders right now</p>
          <p className="text-ink-400 text-sm mt-1">New deliveries will show up here automatically</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sorted.map((order) => (
              <RiderOrderCard key={order._id} order={order} isNew={newOrderIds.has(order._id)} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
