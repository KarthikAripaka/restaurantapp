import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Bike as BikeIcon, Package, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useRiderOrdersStore from '../store/riderOrdersStore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { rider, logout } = useAuthStore();
  const { historyOrders } = useRiderOrdersStore();

  const deliveredCount = rider?.totalDeliveries ?? historyOrders.filter((o) => o.status === 'delivered').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="px-4 pt-4 space-y-5">
      <h1 className="text-xl font-bold text-ink-900">Profile</h1>

      {/* Profile card */}
      <div className="card p-5 text-center">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
          🛵
        </div>
        <p className="font-bold text-ink-900 text-lg">{rider?.name || '—'}</p>
        <p className="text-ink-500 text-sm mt-0.5">Delivery Partner</p>
      </div>

      {/* Stats */}
      <div className="card p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Package size={18} className="text-green-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-ink-900">{deliveredCount}</p>
          <p className="text-xs text-ink-500">Total deliveries completed</p>
        </div>
      </div>

      {/* Details */}
      <div className="card divide-y divide-ink-900/[0.07]">
        <div className="flex items-center gap-3 p-4">
          <Phone size={16} className="text-ink-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-ink-400">Phone</p>
            <p className="text-sm text-ink-900">{rider?.phone || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Mail size={16} className="text-ink-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-ink-400">Email</p>
            <p className="text-sm text-ink-900 truncate">{rider?.email || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <BikeIcon size={16} className="text-ink-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-ink-400">Vehicle Number</p>
            <p className="text-sm text-ink-900">{rider?.vehicleNumber || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="btn-tap bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
};

export default ProfilePage;
