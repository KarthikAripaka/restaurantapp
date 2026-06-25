import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/order.dart';
import '../providers/orders_provider.dart';
import '../theme/app_theme.dart';
import 'location_map.dart';

class RiderOrderCard extends StatefulWidget {
  final Order order;
  final bool isNew;
  final String token;

  const RiderOrderCard({
    super.key,
    required this.order,
    this.isNew = false,
    required this.token,
  });

  @override
  State<RiderOrderCard> createState() => _RiderOrderCardState();
}

class _RiderOrderCardState extends State<RiderOrderCard> {
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    if (widget.isNew) {
      // Automatically acknowledge new status after a small delay to clear the glow
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) {
            Provider.of<OrdersProvider>(context, listen: false)
                .acknowledgeNew(widget.order.id);
          }
        });
      });
    }
  }

  String _formatTimeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);
    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'just now';
    }
  }

  Widget _buildStatusBadge(String status) {
    Color bgColor;
    Color textColor;
    String text;

    switch (status) {
      case 'ready':
        bgColor = Colors.blue[50]!;
        textColor = Colors.blue[700]!;
        text = 'Ready for Pickup';
        break;
      case 'out_for_delivery':
        bgColor = Colors.orange[50]!;
        textColor = Colors.orange[800]!;
        text = 'Out for Delivery';
        break;
      case 'delivered':
        bgColor = Colors.green[50]!;
        textColor = Colors.green[700]!;
        text = 'Delivered';
        break;
      case 'cancelled':
        bgColor = Colors.red[50]!;
        textColor = Colors.red[700]!;
        text = 'Cancelled';
        break;
      default:
        bgColor = Colors.grey[100]!;
        textColor = Colors.grey[700]!;
        text = status.toUpperCase();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: textColor,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Future<void> _handleCall() async {
    final uri = Uri.parse('tel:${widget.order.customer.phone}');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open phone dialer')),
          );
        }
      }
    } catch (e) {
      debugPrint('Error dialing phone: $e');
    }
  }

  Future<void> _handleNavigate() async {
    final hasLoc = widget.order.customer.location != null;
    Uri uri;
    if (hasLoc) {
      final loc = widget.order.customer.location!;
      uri = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}');
    } else {
      final destAddress = '${widget.order.customer.address}${widget.order.customer.landmark != null ? ', ${widget.order.customer.landmark}' : ''}';
      uri = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(destAddress)}');
    }

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open navigation map')),
          );
        }
      }
    } catch (e) {
      debugPrint('Error launching navigation: $e');
    }
  }

  Future<void> _handleStartDelivery() async {
    setState(() {
      _isUpdating = true;
    });

    final ordersProvider = Provider.of<OrdersProvider>(context, listen: false);
    final result = await ordersProvider.startDelivery(widget.order.id, widget.token);

    setState(() {
      _isUpdating = false;
    });

    if (mounted) {
      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Delivery started — drive safe! 🛵'),
            backgroundColor: AppColors.brandGreen,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Could not start delivery'),
            backgroundColor: AppColors.brandRed,
          ),
        );
      }
    }
  }

  Future<void> _handleFinishOrder() async {
    setState(() {
      _isUpdating = true;
    });

    final ordersProvider = Provider.of<OrdersProvider>(context, listen: false);
    final result = await ordersProvider.finishOrder(widget.order.id, widget.token);

    setState(() {
      _isUpdating = false;
    });

    if (mounted) {
      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order delivered! Great job 🎉'),
            backgroundColor: AppColors.brandGreen,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Could not finish order'),
            backgroundColor: AppColors.brandRed,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final hasLoc = order.customer.location != null;
    final itemsText = order.items.map((i) => '${i.name} x${i.quantity}').join(', ');

    return Card(
      margin: const EdgeInsets.only(bottom: 14.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: widget.isNew ? AppColors.brandOrange : AppColors.cardBorder,
          width: widget.isNew ? 1.5 : 1,
        ),
      ),
      elevation: widget.isNew ? 4 : 0,
      shadowColor: widget.isNew ? AppColors.brandOrange.withOpacity(0.1) : Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Flexible(
                            child: Text(
                              order.orderId,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: AppColors.ink900,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          _buildStatusBadge(order.status),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.access_time, size: 12, color: AppColors.ink400),
                          const SizedBox(width: 4),
                          Text(
                            _formatTimeAgo(order.createdAt),
                            style: const TextStyle(fontSize: 11, color: AppColors.ink400),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '₹${order.total.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.ink900,
                      ),
                    ),
                    if (order.paymentMethod == 'cod')
                      const Text(
                        'Cash on delivery',
                        style: TextStyle(fontSize: 11, color: AppColors.ink400),
                      ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Customer Info Block
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.cream100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    order.customer.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: AppColors.ink900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on, size: 14, color: AppColors.ink600),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${order.customer.address}${order.customer.landmark != null ? ' · ${order.customer.landmark}' : ''}',
                          style: const TextStyle(fontSize: 13, color: AppColors.ink700),
                        ),
                      ),
                    ],
                  ),
                  if (order.customer.notes != null && order.customer.notes!.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.amber[50],
                        border: Border.all(color: Colors.amber[200]!),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '📝 ${order.customer.notes}',
                        style: TextStyle(
                          color: Colors.amber[900],
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),

                  // Call & Navigate Row
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _handleCall,
                          icon: const Icon(Icons.phone, size: 15),
                          label: const Text('Call'),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.ink900,
                            side: BorderSide(color: AppColors.ink900.withOpacity(0.1)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _handleNavigate,
                          icon: const Icon(Icons.navigation, size: 15),
                          label: const Text('Navigate'),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.ink900,
                            side: BorderSide(color: AppColors.ink900.withOpacity(0.1)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ],
                  ),

                  if (hasLoc) ...[
                    const SizedBox(height: 10),
                    LocationMap(
                      destLat: order.customer.location!.lat,
                      destLng: order.customer.location!.lng,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Items list summary
            Text(
              '${order.items.length} item${order.items.length > 1 ? "s" : ""} · $itemsText',
              style: const TextStyle(fontSize: 11, color: AppColors.ink400),
            ),
            const SizedBox(height: 14),

            // Actions Button
            if (order.status == 'ready')
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: AppColors.primaryGradient,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.brandRed.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: ElevatedButton.icon(
                  onPressed: _isUpdating ? null : _handleStartDelivery,
                  icon: const Icon(Icons.directions_bike, color: Colors.white),
                  label: _isUpdating
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text(
                          'Start Delivery',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    foregroundColor: Colors.white,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),

            if (order.status == 'out_for_delivery')
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: AppColors.successGradient,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.brandGreen.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: ElevatedButton.icon(
                  onPressed: _isUpdating ? null : _handleFinishOrder,
                  icon: const Icon(Icons.check_circle_outline, color: Colors.white),
                  label: _isUpdating
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text(
                          'Finish Order',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    foregroundColor: Colors.white,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
