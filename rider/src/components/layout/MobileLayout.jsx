import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import useSocket from '../../hooks/useSocket';
import useAuthStore from '../../store/authStore';
import dfcLogo from '../../assets/dfc-logo.png';

const MobileLayout = () => {
  useSocket(); // Connect + join rider room for live assignment alerts
  const { rider } = useAuthStore();

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <header className="safe-top sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-ink-900/[0.07]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={dfcLogo} alt="DFC" className="w-9 h-9 object-contain flex-shrink-0" />
            <div>
              <p className="font-bold text-ink-900 text-sm leading-tight">{rider?.name || 'Rider'}</p>
              <p className="text-[11px] text-ink-500">DFC Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default MobileLayout;
