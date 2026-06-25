import { useEffect } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import useRiderOrdersStore from '../store/riderOrdersStore';
import { format } from 'date-fns';

const HistoryPage = () => {
  const { historyOrders, isLoading, fetchHistory } = useRiderOrdersStore();

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="px-4 pt-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Delivery History</h1>
        <p className="text-ink-500 text-sm">Your last {historyOrders.length} completed orders</p>
      </div>

      {isLoading && historyOrders.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 h-20 animate-pulse bg-cream-100" />
          ))}
        </div>
      ) : historyOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-ink-700 font-medium">No deliveries yet</p>
          <p className="text-ink-400 text-sm mt-1">Completed orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {historyOrders.map((order) => (
            <div key={order._id} className="card p-3.5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {order.status === 'delivered' ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-ink-900 text-sm">{order.orderId}</span>
                  <span className="font-bold text-ink-900 text-sm">₹{order.total}</span>
                </div>
                <p className="text-xs text-ink-500 truncate">{order.customer.name} · {order.customer.address}</p>
                <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
                  <Clock size={10} />
                  {order.deliveredAt
                    ? format(new Date(order.deliveredAt), 'MMM d, h:mm a')
                    : format(new Date(order.updatedAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
