import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Bike, Phone, Mail, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', phone: '', email: '', password: '', vehicleNumber: '' };

const RidersPage = () => {
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRiders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard/riders');
      setRiders(res.data.data.riders);
    } catch {
      toast.error('Failed to load delivery boys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRiders(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.password) {
      toast.error('Name, phone, email and password are required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.post('/dashboard/riders', form);
      setRiders((prev) => [{ ...res.data.data.rider, activeOrders: 0 }, ...prev]);
      toast.success('Delivery boy added');
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add delivery boy');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (rider) => {
    try {
      const res = await api.patch(`/dashboard/riders/${rider._id}/toggle`);
      setRiders((prev) => prev.map((r) => (r._id === rider._id ? { ...r, ...res.data.data.rider } : r)));
      toast.success(res.data.data.rider.isActive ? 'Rider activated' : 'Rider deactivated');
    } catch {
      toast.error('Failed to update rider');
    }
  };

  const handleRemove = async (rider) => {
    if (!confirm(`Remove "${rider.name}"? Any orders currently with them will be unassigned.`)) return;
    try {
      await api.delete(`/dashboard/riders/${rider._id}`);
      setRiders((prev) => prev.filter((r) => r._id !== rider._id));
      toast.success('Delivery boy removed');
    } catch {
      toast.error('Failed to remove delivery boy');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Delivery Boys</h1>
          <p className="text-ink-500 text-sm mt-1">{riders.length} rider{riders.length !== 1 ? 's' : ''} on your team</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={17} /> Add Delivery Boy
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="card p-8 text-center text-ink-500">Loading delivery boys...</div>
      ) : riders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center card">
          <Bike size={40} className="text-ink-300 mb-3" />
          <p className="text-ink-600 font-medium">No delivery boys yet</p>
          <p className="text-ink-400 text-sm mt-1 mb-4">Add your first rider to start assigning orders</p>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Delivery Boy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {riders.map((rider) => (
            <div key={rider._id} className={`card p-5 space-y-3 ${!rider.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bike size={20} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-ink-900 text-sm truncate">{rider.name}</p>
                    <p className="text-xs text-ink-500">{rider.vehicleNumber || 'No vehicle number'}</p>
                  </div>
                </div>
                <button onClick={() => handleToggle(rider)} className="flex-shrink-0 transition-colors" title="Active / Inactive">
                  {rider.isActive
                    ? <ToggleRight size={26} className="text-green-500" />
                    : <ToggleLeft size={26} className="text-ink-300" />}
                </button>
              </div>

              <div className="space-y-1.5 text-sm">
                <a href={`tel:${rider.phone}`} className="flex items-center gap-2 text-ink-600 hover:text-brand-600 transition-colors">
                  <Phone size={13} /> {rider.phone}
                </a>
                <p className="flex items-center gap-2 text-ink-600 truncate">
                  <Mail size={13} className="flex-shrink-0" /> <span className="truncate">{rider.email}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-ink-900/[0.07]">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <Package size={13} />
                  <span>{rider.activeOrders > 0
                    ? <span className="text-brand-600 font-semibold">{rider.activeOrders} active order{rider.activeOrders > 1 ? 's' : ''}</span>
                    : 'No active orders'}</span>
                </div>
                <button onClick={() => handleRemove(rider)}
                  className="p-2 hover:bg-red-50 rounded-lg text-ink-400 hover:text-red-600 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="text-xs text-ink-400">{rider.totalDeliveries || 0} total deliveries</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-ink-900/[0.08] rounded-2xl w-full max-w-md shadow-soft-lg">
            <div className="flex items-center justify-between p-6 border-b border-ink-900/[0.06]">
              <h2 className="text-lg font-bold text-ink-900">Add Delivery Boy</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-cream-100 rounded-lg transition-colors">
                <X size={18} className="text-ink-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ravi Kumar" className="input" required autoFocus />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210" className="input" required />
              </div>
              <div>
                <label className="label">Email (used to log in) *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="rider@dfcrestaurant.com" className="input" required />
              </div>
              <div>
                <label className="label">Password *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters" className="input" required minLength={6} />
              </div>
              <div>
                <label className="label">Vehicle Number <span className="text-ink-400 text-xs">optional</span></label>
                <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                  placeholder="AP 39 XX 1234" className="input" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-ink-900/[0.06]">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn-primary flex-1">
                  {isSaving ? 'Adding...' : 'Add Delivery Boy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RidersPage;
