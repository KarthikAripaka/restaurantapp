import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useRiderOrdersStore from '../store/riderOrdersStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

const useSocket = () => {
  const { rider } = useAuthStore();
  const { addAssignedOrder, syncOrder } = useRiderOrdersStore();
  const hasVibrated = useRef(false);

  const playAssignSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio unavailable (e.g. before first user interaction) — ignore
    }
  }, []);

  useEffect(() => {
    if (!rider?._id) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        transports: ['websocket', 'polling'],
      });
    }

    const socket = socketInstance;

    socket.on('connect', () => {
      socket.emit('join-rider', rider._id);
    });

    socket.on('order-assigned', (order) => {
      addAssignedOrder(order);
      playAssignSound();
      if (navigator.vibrate) navigator.vibrate([120, 60, 120]);

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-slide-up' : 'opacity-0'} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3`}
          style={{ background: 'linear-gradient(135deg, #e2131c, #f7780e)' }}>
          <span className="text-2xl">🛵</span>
          <div>
            <p className="font-bold">New delivery assigned!</p>
            <p className="text-sm opacity-90">{order.orderId} · ₹{order.total}</p>
          </div>
        </div>
      ), { duration: 6000 });
    });

    socket.on('order-status-update', ({ order, status }) => {
      if (!order) return;

      if (status === 'cancelled') {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-slide-up' : 'opacity-0'} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3`}
            style={{ background: 'linear-gradient(135deg, #e2131c, #950c14)' }}>
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold">Order Cancelled</p>
              <p className="text-sm opacity-90">{order.orderId} was cancelled by the restaurant</p>
            </div>
          </div>
        ), { duration: 7000 });
      }

      syncOrder(order);
    });

    return () => {
      socket.off('order-assigned');
      socket.off('order-status-update');
      socket.off('connect');
    };
  }, [rider?._id]);

  return { socket: socketInstance };
};

export default useSocket;
