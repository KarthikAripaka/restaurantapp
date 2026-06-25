import { useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import StickyOrderButton from './components/shared/StickyOrderButton';
import useNotificationStore from './store/notificationStore';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import OffersPage from './pages/OffersPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ContactPage from './pages/ContactPage';
import CheckoutPage from './pages/CheckoutPage';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

const Layout = () => {
  const cartIconRef = useRef(null);
  const checkForUpdates = useNotificationStore((s) => s.checkForUpdates);

  // Expose cart icon ref globally for fly-to-cart
  useEffect(() => {
    const cartEl = document.querySelector('[data-cart-icon]');
    if (cartEl) cartIconRef.current = cartEl;
  }, []);

  // Check once on load whether the customer has an unseen order cancellation
  useEffect(() => { checkForUpdates(); }, []);

  return (
    <>
      <ScrollToTop />
      <Navbar cartRef={cartIconRef} />
      <CartDrawer />
      <StickyOrderButton />

      <main>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/menu"     element={<MenuPage />} />
          <Route path="/offers"   element={<OffersPage />} />
          <Route path="/track"    element={<TrackOrderPage />} />
          <Route path="/contact"  element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          {/* Catch-all */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1a1816',
            color: '#fffdfb',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#f7780e', secondary: '#fff' } },
          duration: 2500,
        }}
      />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
