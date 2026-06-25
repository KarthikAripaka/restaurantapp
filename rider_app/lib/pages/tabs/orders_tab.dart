import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/orders_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/rider_order_card.dart';

class OrdersTab extends StatefulWidget {
  const OrdersTab({super.key});

  @override
  State<OrdersTab> createState() => _OrdersTabState();
}

class _OrdersTabState extends State<OrdersTab> {
  Future<void> _handleRefresh() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final ordersProvider = Provider.of<OrdersProvider>(context, listen: false);
    if (authProvider.token != null) {
      await ordersProvider.fetchActive(authProvider.token!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final ordersProvider = Provider.of<OrdersProvider>(context);

    // Sort: out_for_delivery first, then ready by assignment/created time
    final activeOrders = ordersProvider.activeOrders;
    final sortedOrders = List<dynamic>.from(activeOrders);
    sortedOrders.sort((a, b) {
      if (a.status == b.status) return 0;
      return a.status == 'out_for_delivery' ? -1 : 1;
    });

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'My Orders',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.ink900),
            ),
            const SizedBox(height: 2),
            Text(
              activeOrders.isEmpty
                  ? 'No active deliveries'
                  : '${activeOrders.length} active delivery${activeOrders.length > 1 ? 'ies' : ''}',
              style: const TextStyle(fontSize: 12, color: AppColors.ink500, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: ordersProvider.isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.ink700,
                    ),
                  )
                : IconButton(
                    icon: const Icon(Icons.refresh, color: AppColors.ink700),
                    onPressed: _handleRefresh,
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: AppColors.cardBorder),
                      ),
                    ),
                  ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _handleRefresh,
        color: AppColors.brandRed,
        backgroundColor: Colors.white,
        child: sortedOrders.isEmpty && !ordersProvider.isLoading
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.22),
                  const Center(
                    child: Text(
                      '🛵',
                      style: TextStyle(fontSize: 64),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Center(
                    child: Text(
                      'No orders right now',
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
                      'New deliveries will show up here automatically',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.ink400,
                      ),
                    ),
                  ),
                ],
              )
            : sortedOrders.isEmpty && ordersProvider.isLoading
                ? ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: 2,
                    itemBuilder: (context, index) {
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16.0),
                        child: Container(
                          height: 180,
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(width: 120, height: 16, color: AppColors.cream100),
                              const SizedBox(height: 16),
                              Container(width: double.infinity, height: 12, color: AppColors.cream100),
                              const SizedBox(height: 8),
                              Container(width: 200, height: 12, color: AppColors.cream100),
                              const Spacer(),
                              Container(width: double.infinity, height: 44, color: AppColors.cream100),
                            ],
                          ),
                        ),
                      );
                    },
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: sortedOrders.length,
                    itemBuilder: (context, index) {
                      final order = sortedOrders[index];
                      final isNew = ordersProvider.newOrderIds.contains(order.id);
                      return RiderOrderCard(
                        order: order,
                        isNew: isNew,
                        token: authProvider.token ?? '',
                      );
                    },
                  ),
      ),
    );
  }
}
