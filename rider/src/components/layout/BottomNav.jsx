import { NavLink } from 'react-router-dom';
import { Bike, History, User } from 'lucide-react';
import useRiderOrdersStore from '../../store/riderOrdersStore';

const NAV_ITEMS = [
  { to: '/orders', icon: Bike, label: 'Active', showBadge: true },
  { to: '/history', icon: History, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const { activeOrders } = useRiderOrdersStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-900/[0.07] safe-bottom z-30 shadow-soft-lg">
      <div className="grid grid-cols-3 max-w-md mx-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2.5 relative transition-colors
              ${isActive ? 'text-brand-600' : 'text-ink-400'}`
            }
          >
            <div className="relative">
              <Icon size={22} />
              {showBadge && activeOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
                  {activeOrders.length > 9 ? '9+' : activeOrders.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
