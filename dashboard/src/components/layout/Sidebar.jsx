import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, BarChart3,
  Settings, LogOut, Bike,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useOrdersStore from '../../store/ordersStore';
import dfcLogo from '../../assets/dfc-logo.png';

const NAV_ITEMS = [
  { to: '/orders', icon: LayoutDashboard, label: 'Orders', showBadge: true },
  { to: '/riders', icon: Bike, label: 'Delivery Boys' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { restaurant, logout } = useAuthStore();
  const { unacknowledgedIds } = useOrdersStore();
  const unreadCount = unacknowledgedIds.size;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-ink-900/[0.07] flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-ink-900/[0.07]">
        <div className="flex items-center gap-3">
          <img src={dfcLogo} alt="DFC" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-bold text-ink-900 leading-tight text-sm">
              {restaurant?.name || 'DFC Restaurant'}
            </h1>
            <p className="text-xs text-ink-500">Restaurant Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-150 relative group
              ${isActive
                ? 'bg-brand-50 text-brand-600 border border-brand-200'
                : 'text-ink-600 hover:bg-cream-100 hover:text-ink-900'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
            {showBadge && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center animate-pulse-fast">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-ink-900/[0.07] space-y-2">
        <div className="px-4 py-3 rounded-xl bg-cream-100">
          <p className="text-xs text-ink-500">Logged in as</p>
          <p className="text-sm text-ink-700 font-medium truncate">{restaurant?.ownerEmail || '—'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-ink-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
