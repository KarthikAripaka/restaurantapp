const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');

const getDateRange = (type) => {
  const now = new Date();
  let start, end;

  if (type === 'today') {
    start = new Date(now); start.setHours(0, 0, 0, 0);
    end = new Date(now); end.setHours(23, 59, 59, 999);
  } else if (type === 'week') {
    start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end = new Date(now); end.setHours(23, 59, 59, 999);
  } else if (type === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now); end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

exports.getSummary = catchAsync(async (req, res, next) => {
  const restaurantId = req.restaurant._id;
  const { type = 'today' } = req.query;
  const { start, end } = getDateRange(type);

  const baseFilter = {
    restaurantId,
    createdAt: { $gte: start, $lte: end },
    status: { $nin: ['cancelled'] },
  };

  const [orders, cancelled] = await Promise.all([
    Order.find(baseFilter).select('total items status createdAt'),
    Order.countDocuments({ restaurantId, createdAt: { $gte: start, $lte: end }, status: 'cancelled' }),
  ]);

  const totalOrders = orders.length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

  // Status breakdown
  const statusBreakdown = {};
  orders.forEach((o) => {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
  });

  // Best sellers
  const itemMap = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.name;
      if (!itemMap[key]) itemMap[key] = { name: key, quantity: 0, revenue: 0 };
      itemMap[key].quantity += item.quantity;
      itemMap[key].revenue += item.price * item.quantity;
    });
  });
  const bestSellers = Object.values(itemMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Hourly distribution (today only)
  let hourlyData = [];
  if (type === 'today') {
    const hourMap = {};
    orders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    hourlyData = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: hourMap[h] || 0 }));
  }

  // Daily breakdown (week/month)
  let dailyData = [];
  if (type !== 'today') {
    const dayMap = {};
    orders.forEach((o) => {
      const day = new Date(o.createdAt).toISOString().slice(0, 10);
      if (!dayMap[day]) dayMap[day] = { date: day, orders: 0, revenue: 0 };
      dayMap[day].orders += 1;
      dayMap[day].revenue += o.total;
    });
    dailyData = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  res.status(200).json({
    success: true,
    data: {
      period: type,
      range: { start, end },
      summary: {
        totalOrders,
        revenue: Math.round(revenue * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        cancelledOrders: cancelled,
      },
      statusBreakdown,
      bestSellers,
      hourlyData,
      dailyData,
    },
  });
});

exports.getRevenueChart = catchAsync(async (req, res, next) => {
  const restaurantId = req.restaurant._id;
  const { from, to } = req.query;

  const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    restaurantId,
    createdAt: { $gte: start, $lte: end },
    status: { $nin: ['cancelled'] },
  }).select('total createdAt');

  const dayMap = {};
  orders.forEach((o) => {
    const day = new Date(o.createdAt).toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { date: day, orders: 0, revenue: 0 };
    dayMap[day].orders += 1;
    dayMap[day].revenue += o.total;
  });

  const data = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  res.status(200).json({ success: true, data: { chart: data } });
});
