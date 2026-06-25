import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/orders_provider.dart';
import '../../theme/app_theme.dart';

class HistoryTab extends StatefulWidget {
  const HistoryTab({super.key});

  @override
  State<HistoryTab> createState() => _HistoryTabState();
}

class _HistoryTabState extends State<HistoryTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final ordersProvider = Provider.of<OrdersProvider>(context, listen: false);
      if (authProvider.token != null) {
        ordersProvider.fetchHistory(authProvider.token!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final ordersProvider = Provider.of<OrdersProvider>(context);
    final historyOrders = ordersProvider.historyOrders;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Delivery History',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.ink900),
            ),
            const SizedBox(height: 2),
            Text(
              'Your last ${historyOrders.length} completed orders',
              style: const TextStyle(fontSize: 12, color: AppColors.ink500, fontWeight: FontWeight.normal),
            ),
          ],
        ),
      ),
      body: ordersProvider.isLoading && historyOrders.isEmpty
          ? ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: 3,
              itemBuilder: (context, index) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 10.0),
                  child: Container(
                    height: 80,
                    color: AppColors.cream100.withOpacity(0.5),
                  ),
                );
              },
            )
          : historyOrders.isEmpty
              ? ListView(
                  children: [
                    SizedBox(height: MediaQuery.of(context).size.height * 0.22),
                    const Center(
                      child: Text(
                        '📦',
                        style: TextStyle(fontSize: 64),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Center(
                      child: Text(
                        'No deliveries yet',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.ink700,
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Center(
                      child: Text(
                        'Completed orders will appear here',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.ink400,
                        ),
                      ),
                    ),
                  ],
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: historyOrders.length,
                  itemBuilder: (context, index) {
                    final order = historyOrders[index];
                    final isDelivered = order.status == 'delivered';
                    final dateToFormat = order.deliveredAt ?? order.updatedAt;
                    final formattedDate = DateFormat('MMM d, h:mm a').format(dateToFormat);

                    return Card(
                      margin: const EdgeInsets.only(bottom: 10.0),
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Status icon wrapper
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: isDelivered ? Colors.green[50] : Colors.red[50],
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                isDelivered ? Icons.check_circle_outline : Icons.cancel_outlined,
                                color: isDelivered ? Colors.green[600] : Colors.red[600],
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        order.orderId,
                                        style: const TextStyle(
                                          fontFamily: 'monospace',
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: AppColors.ink900,
                                        ),
                                      ),
                                      Text(
                                        '₹${order.total.toStringAsFixed(0)}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: AppColors.ink900,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    '${order.customer.name} · ${order.customer.address}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.ink500,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.access_time, size: 10, color: AppColors.ink400),
                                      const SizedBox(width: 4),
                                      Text(
                                        formattedDate,
                                        style: const TextStyle(
                                          fontSize: 10,
                                          color: AppColors.ink400,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
