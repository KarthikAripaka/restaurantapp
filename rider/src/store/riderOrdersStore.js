import { create } from 'zustand';
import api from '../services/api';

const useRiderOrdersStore = create((set, get) => ({
  activeOrders: [],
  historyOrders: [],
  isLoading: false,
  newOrderIds: new Set(), // freshly-assigned, not yet seen by the rider

  fetchActive: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/rider/orders', { params: { view: 'active' } });
      set({ activeOrders: res.data.data.orders, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchHistory: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/rider/orders', { params: { view: 'history' } });
      set({ historyOrders: res.data.data.orders, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Called by socket 'order-assigned'
  addAssignedOrder: (order) => {
    set((state) => {
      if (state.activeOrders.some((o) => o._id === order._id)) return state;
      return {
        activeOrders: [...state.activeOrders, order],
        newOrderIds: new Set([...state.newOrderIds, order._id]),
      };
    });
  },

  // Called by socket 'order-status-update'
  syncOrder: (order) => {
    set((state) => {
      const stillActive = ['ready', 'out_for_delivery'].includes(order.status);
      if (stillActive) {
        return {
          activeOrders: state.activeOrders.map((o) => (o._id === order._id ? order : o)),
        };
      }
      // Moved out of active (delivered/cancelled/unassigned) — drop from active list
      return {
        activeOrders: state.activeOrders.filter((o) => o._id !== order._id),
      };
    });
  },

  acknowledgeNew: (id) => {
    set((state) => ({
      newOrderIds: new Set([...state.newOrderIds].filter((nid) => nid !== id)),
    }));
  },

  startDelivery: async (id) => {
    try {
      const res = await api.patch(`/rider/orders/${id}/start`);
      const updated = res.data.data.order;
      set((state) => ({
        activeOrders: state.activeOrders.map((o) => (o._id === id ? updated : o)),
      }));
      return { success: true, order: updated };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  finishOrder: async (id) => {
    try {
      const res = await api.patch(`/rider/orders/${id}/finish`);
      const updated = res.data.data.order;
      set((state) => ({
        activeOrders: state.activeOrders.filter((o) => o._id !== id),
        historyOrders: [updated, ...state.historyOrders],
      }));
      return { success: true, order: updated };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },
}));

export default useRiderOrdersStore;
