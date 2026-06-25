import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/orders_provider.dart';
import '../services/socket_service.dart';
import '../theme/app_theme.dart';
import 'tabs/orders_tab.dart';
import 'tabs/history_tab.dart';
import 'tabs/profile_tab.dart';

class HomeLayout extends StatefulWidget {
  const HomeLayout({super.key});

  @override
  State<HomeLayout> createState() => _HomeLayoutState();
}

class _HomeLayoutState extends State<HomeLayout> {
  int _currentIndex = 0;
  late SocketService _socketService;

  final List<Widget> _tabs = const [
    OrdersTab(),
    HistoryTab(),
    ProfileTab(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initServices();
    });
  }

  void _initServices() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final ordersProvider = Provider.of<OrdersProvider>(context, listen: false);
    _socketService = Provider.of<SocketService>(context, listen: false);

    if (authProvider.rider != null) {
      // Connect to WebSocket room
      _socketService.connect(authProvider.rider!.id, ordersProvider);
    }

    if (authProvider.token != null) {
      // Prefetch orders
      ordersProvider.fetchActive(authProvider.token!);
      ordersProvider.fetchHistory(authProvider.token!);
      ordersProvider.startPolling(authProvider.token!);
    }
  }

  @override
  void dispose() {
    // Note: Usually SocketService is app-wide and persists, but we disconnect if the widget tree changes
    final ordersProvider = Provider.of<OrdersProvider>(context, listen: false);
    ordersProvider.stopPolling();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<SocketService>(
      builder: (context, socketService, child) {
        return Scaffold(
          body: IndexedStack(
            index: _currentIndex,
            children: _tabs,
          ),
          bottomNavigationBar: Container(
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: AppColors.cardBorder,
                  width: 1,
                ),
              ),
            ),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              backgroundColor: AppColors.white,
              selectedItemColor: AppColors.brandRed,
              unselectedItemColor: AppColors.ink500,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle: const TextStyle(fontSize: 12),
              type: BottomNavigationBarType.fixed,
              items: [
                const BottomNavigationBarItem(
                  icon: Icon(Icons.delivery_dining_outlined),
                  activeIcon: Icon(Icons.delivery_dining, color: AppColors.brandRed),
                  label: 'Orders',
                ),
                const BottomNavigationBarItem(
                  icon: Icon(Icons.history_outlined),
                  activeIcon: Icon(Icons.history, color: AppColors.brandRed),
                  label: 'History',
                ),
                BottomNavigationBarItem(
                  icon: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      const Icon(Icons.person_outline),
                      if (!socketService.isConnected)
                        Positioned(
                          right: -2,
                          top: -2,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Colors.amber,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                  activeIcon: const Icon(Icons.person, color: AppColors.brandRed),
                  label: 'Profile',
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
