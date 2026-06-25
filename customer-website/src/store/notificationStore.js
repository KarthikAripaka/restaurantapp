import { create } from 'zustand';
import { getOrderHistory } from '../services/api';
import { isUnseenCancellation } from '../utils/orderNotifications';

// Powers the small red badge on the "Track Order" nav link. Since customers
// don't have accounts, we look up their history using the phone number from
// their most recent order (saved locally) and flag any cancellations they
// haven't acknowledged yet.
const useNotificationStore = create((set, get) => ({
  unseenCancelledOrders: [],
  hasChecked: false,

  checkForUpdates: async () => {
    const lastOrder = JSON.parse(localStorage.getItem('dfc_last_order') || 'null');
    if (!lastOrder?.phone) {
      set({ hasChecked: true });
      return;
    }
    try {
      const data = await getOrderHistory(lastOrder.phone);
      const unseen = (data.orders || []).filter(isUnseenCancellation);
      set({ unseenCancelledOrders: unseen, hasChecked: true });
    } catch {
      set({ hasChecked: true });
    }
  },

  dismissOrder: (orderId) => {
    set((state) => ({
      unseenCancelledOrders: state.unseenCancelledOrders.filter((o) => o.orderId !== orderId),
    }));
  },
}));

export default useNotificationStore;
