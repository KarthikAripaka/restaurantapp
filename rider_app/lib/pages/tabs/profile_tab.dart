import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/orders_provider.dart';
import '../../services/socket_service.dart';
import '../../theme/app_theme.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final ordersProvider = Provider.of<OrdersProvider>(context);
    final rider = authProvider.rider;

    final completedCount = rider?.totalDeliveries ??
        ordersProvider.historyOrders.where((o) => o.status == 'delivered').length;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Profile',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.ink900),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Rider avatar & name card
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: AppColors.cream100,
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Text(
                          '🛵',
                          style: TextStyle(fontSize: 36),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      rider?.name ?? '—',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.ink900,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Delivery Partner',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.ink500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Completed deliveries count card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: Colors.green[50],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.local_shipping_outlined,
                        color: Colors.green[600],
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          completedCount.toString(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.ink900,
                          ),
                        ),
                        const Text(
                          'Total deliveries completed',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.ink500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Profile info card (details)
            Card(
              child: Column(
                children: [
                  // Phone Row
                  _buildDetailRow(
                    icon: Icons.phone_outlined,
                    label: 'Phone',
                    value: rider?.phone ?? '—',
                  ),
                  const Divider(height: 1, color: AppColors.cardBorder),
                  // Email Row
                  _buildDetailRow(
                    icon: Icons.email_outlined,
                    label: 'Email',
                    value: rider?.email ?? '—',
                  ),
                  const Divider(height: 1, color: AppColors.cardBorder),
                  // Vehicle number Row
                  _buildDetailRow(
                    icon: Icons.directions_bike_outlined,
                    label: 'Vehicle Number',
                    value: rider?.vehicleNumber ?? 'Not set',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            OutlinedButton.icon(
              onPressed: () async {
                // Disconnect WebSocket
                Provider.of<SocketService>(context, listen: false).disconnect();
                // Logout from provider
                await authProvider.logout();
                if (context.mounted) {
                  Navigator.pushReplacementNamed(context, '/login');
                }
              },
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Logout'),
              style: OutlinedButton.styleFrom(
                backgroundColor: const Color(0xFFFFEBEE),
                foregroundColor: AppColors.brandRed,
                side: BorderSide(color: Colors.red[100]!),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppColors.ink400),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.ink400,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.ink900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
