import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, ShoppingBag, IndianRupee, XCircle, Award } from 'lucide-react';
import api from '../services/api';

const PERIOD_OPTIONS = [
  { value: 'today', label: "Today" },
  { value: 'week',  label: "Last 7 Days" },
  { value: 'month', label: "This Month" },
];

const PIE_COLORS = ['#f7780e', '#3b82f6', '#a855f7', '#5b9e0f', '#9b958e', '#e2131c'];

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-brand-600' }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-ink-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
        <Icon size={20} className={color} />
      </div>
    </div>
  </div>
);

const ReportsPage = () => {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/dashboard/reports/summary?type=${period}`);
      setData(res.data.data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [period]);

  const statusPieData = data
    ? Object.entries(data.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const chartData = period === 'today' ? data?.hourlyData : data?.dailyData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Reports</h1>
          <p className="text-ink-500 text-sm mt-1">Business analytics & insights</p>
        </div>
        <div className="flex gap-1 bg-white border border-ink-900/[0.07] rounded-xl p-1 shadow-soft">
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button key={value} onClick={() => setPeriod(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${period === value ? 'bg-cream-100 text-ink-900' : 'text-ink-500 hover:text-ink-900'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse">
              <div className="h-4 bg-cream-100 rounded w-1/2 mb-3" />
              <div className="h-8 bg-cream-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={ShoppingBag} label="Total Orders" value={data?.summary.totalOrders}
              sub="Excludes cancelled" color="text-brand-600" />
            <StatCard icon={IndianRupee} label="Revenue" value={`₹${data?.summary.revenue?.toLocaleString()}`}
              sub="Net after discounts" color="text-green-600" />
            <StatCard icon={TrendingUp} label="Avg Order Value" value={`₹${Math.round(data?.summary.avgOrderValue)}`}
              color="text-blue-600" />
            <StatCard icon={XCircle} label="Cancelled" value={data?.summary.cancelledOrders}
              color="text-red-600" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Main chart */}
            <div className="xl:col-span-2 card p-5">
              <h3 className="font-semibold text-ink-900 mb-4">
                {period === 'today' ? 'Orders by Hour' : 'Orders & Revenue by Day'}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                {period === 'today' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eeece8" />
                    <XAxis dataKey="hour" tick={{ fill: '#9b958e', fontSize: 11 }}
                      tickFormatter={(h) => `${h}:00`} />
                    <YAxis tick={{ fill: '#9b958e', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #eeece8', borderRadius: 8 }}
                      labelStyle={{ color: '#5c5752' }} itemStyle={{ color: '#f7780e' }}
                      labelFormatter={(h) => `${h}:00 - ${h + 1}:00`}
                    />
                    <Bar dataKey="count" fill="#f7780e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eeece8" />
                    <XAxis dataKey="date" tick={{ fill: '#9b958e', fontSize: 10 }}
                      tickFormatter={(d) => d?.slice(5)} />
                    <YAxis yAxisId="left" tick={{ fill: '#9b958e', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9b958e', fontSize: 11 }}
                      tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #eeece8', borderRadius: 8 }}
                      labelStyle={{ color: '#5c5752' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#f7780e" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#5b9e0f" strokeWidth={2} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Status pie */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-900 mb-4">Order Status</h3>
              {statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      dataKey="value" paddingAngle={2}>
                      {statusPieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #eeece8', borderRadius: 8 }}
                    />
                    <Legend formatter={(v) => <span style={{ color: '#5c5752', textTransform: 'capitalize' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-ink-400">No data</div>
              )}
            </div>
          </div>

          {/* Best sellers */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> Best Selling Items
            </h3>
            {data?.bestSellers?.length > 0 ? (
              <div className="space-y-3">
                {data.bestSellers.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-6 text-center ${i < 3 ? 'text-amber-500' : 'text-ink-400'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-ink-900 font-medium truncate">{item.name}</span>
                        <span className="text-sm text-ink-500 flex-shrink-0 ml-3">{item.quantity} sold · ₹{item.revenue}</span>
                      </div>
                      <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (item.quantity / (data.bestSellers[0]?.quantity || 1)) * 100)}%`, background: 'linear-gradient(135deg, #e2131c, #f7780e)' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-500 text-sm text-center py-8">No orders yet in this period</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
