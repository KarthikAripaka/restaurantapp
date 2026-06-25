import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useOrdersStore from '../store/ordersStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const ALERT_INTERVAL_MS = 4000;
const ORIGINAL_TITLE = 'DFC Dashboard';
const FLASH_TITLE = '🔔 NEW ORDER!';

let socketInstance = null;

const useSocket = () => {
  const { restaurant } = useAuthStore();
  const { addOrder, updateOrderInList, removeAcknowledged, unacknowledgedIds } = useOrdersStore();

  const audioRef = useRef(null);
  const alertIntervalRef = useRef(null);
  const titleFlashRef = useRef(null);
  const isTitleFlashingRef = useRef(false);

  // ── Audio ──────────────────────────────────────────────────────────────────
  const createAlertAudio = useCallback(() => {
    // Web Audio API bell sound — no external file needed
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);

    // Second beep
    setTimeout(() => {
      const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
      const osc2 = ctx2.createOscillator();
      const gain2 = ctx2.createGain();
      osc2.connect(gain2); gain2.connect(ctx2.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1100, ctx2.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(550, ctx2.currentTime + 0.3);
      gain2.gain.setValueAtTime(0.8, ctx2.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.6);
      osc2.start(ctx2.currentTime); osc2.stop(ctx2.currentTime + 0.6);
    }, 400);
  }, []);

  // ── Tab title flash ────────────────────────────────────────────────────────
  const startTitleFlash = useCallback(() => {
    if (isTitleFlashingRef.current) return;
    isTitleFlashingRef.current = true;
    let toggled = false;
    titleFlashRef.current = setInterval(() => {
      document.title = toggled ? ORIGINAL_TITLE : FLASH_TITLE;
      toggled = !toggled;
    }, 800);
  }, []);

  const stopTitleFlash = useCallback(() => {
    if (titleFlashRef.current) {
      clearInterval(titleFlashRef.current);
      titleFlashRef.current = null;
    }
    isTitleFlashingRef.current = false;
    document.title = ORIGINAL_TITLE;
  }, []);

  // ── Alert loop ─────────────────────────────────────────────────────────────
  const startAlertLoop = useCallback(() => {
    createAlertAudio();
    startTitleFlash();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (alertIntervalRef.current) return; // already running
    alertIntervalRef.current = setInterval(() => {
      const { unacknowledgedIds: ids } = useOrdersStore.getState();
      if (ids.size === 0) {
        stopAlertLoop();
        return;
      }
      createAlertAudio();
    }, ALERT_INTERVAL_MS);
  }, [createAlertAudio, startTitleFlash]);

  const stopAlertLoop = useCallback(() => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
    stopTitleFlash();
  }, [stopTitleFlash]);

  // ── Watch unacknowledged count ─────────────────────────────────────────────
  useEffect(() => {
    if (unacknowledgedIds.size > 0) {
      startAlertLoop();
    } else {
      stopAlertLoop();
    }
  }, [unacknowledgedIds.size]);

  // ── Socket connection ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!restaurant?._id) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        transports: ['websocket', 'polling'],
      });
    }

    const socket = socketInstance;

    socket.on('connect', () => {
      console.log('✅ Dashboard socket connected');
      socket.emit('join-restaurant', restaurant._id);
    });

    socket.on('new-order', (order) => {
      addOrder(order);

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🍽️ New Order!', {
          body: `${order.customer.name} — ₹${order.total} — ${order.orderId}`,
          icon: '/favicon.png',
          requireInteraction: true,
        });
      }

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-slide-in' : 'opacity-0'} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3`}
          style={{ background: 'linear-gradient(135deg, #e2131c, #f7780e)' }}>
          <span className="text-2xl">🔔</span>
          <div>
            <p className="font-bold">New Order!</p>
            <p className="text-sm opacity-90">{order.customer.name} · ₹{order.total}</p>
          </div>
        </div>
      ), { duration: 8000 });
    });

    socket.on('order-status-update', ({ orderId, status, order }) => {
      updateOrderInList(orderId, status, order);
    });

    socket.on('order-acknowledged', ({ orderId }) => {
      removeAcknowledged(orderId);
    });

    socket.on('disconnect', () => {
      console.warn('Dashboard socket disconnected');
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-update');
      socket.off('order-acknowledged');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [restaurant?._id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlertLoop();
    };
  }, []);

  return { socket: socketInstance };
};

export default useSocket;
