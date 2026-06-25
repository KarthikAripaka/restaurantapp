import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/cartStore';

const StickyOrderButton = () => {
  const [visible, setVisible] = useState(false);
  const { totalItems, subtotal } = useCartStore();
  const location = useLocation();
  const count = totalItems();
  const sub = subtotal();

  // Hide on checkout/menu pages where cart is always accessible
  const isHidden = ['/checkout'].includes(location.pathname);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (isHidden || count === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden"
        >
          <Link
            to="/checkout"
            className="flex items-center gap-3 text-white
                       font-bold px-6 py-4 rounded-full shadow-red-glow
                       active:scale-95 transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #e2131c 0%, #f7780e 100%)' }}
          >
            <ShoppingBag size={20} />
            <span>{count} item{count > 1 ? 's' : ''}</span>
            <span className="w-px h-4 bg-white/30" />
            <span>₹{sub}</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyOrderButton;
