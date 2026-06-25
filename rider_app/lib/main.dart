import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/constants.dart';
import 'providers/auth_provider.dart';
import 'providers/orders_provider.dart';
import 'services/socket_service.dart';
import 'pages/login_page.dart';
import 'pages/home_layout.dart';
import 'theme/app_theme.dart';
import 'utils/audio_helper.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  initAudio();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => OrdersProvider()),
        ChangeNotifierProvider(create: (_) => SocketService()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return MaterialApp(
          scaffoldMessengerKey: scaffoldMessengerKey,
          title: 'DFC Rider',
          theme: AppTheme.lightTheme,
          debugShowCheckedModeBanner: false,
          home: !authProvider.isInitialized
              ? const Scaffold(
                  body: Center(
                    child: CircularProgressIndicator(
                      color: AppColors.brandRed,
                    ),
                  ),
                )
              : authProvider.isAuthenticated
                  ? const HomeLayout()
                  : const LoginPage(),
          routes: {
            '/login': (context) => const LoginPage(),
            '/home': (context) => const HomeLayout(),
          },
        );
      },
    );
  }
}
