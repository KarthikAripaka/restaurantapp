import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import RidersPage from './pages/RidersPage';
import useAuthStore from './store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1816', color: '#fffdfb', border: '1px solid rgba(255,255,255,0.08)' },
          duration: 4000,
        }}
      />

      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/orders" replace /> : <LoginPage />
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/orders" replace />} />
          <Route path="orders"   element={<OrdersPage />} />
          <Route path="riders"   element={<RidersPage />} />
          <Route path="menu"     element={<MenuPage />} />
          <Route path="reports"  element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
