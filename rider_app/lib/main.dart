import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/constants.dart';
import 'providers/auth_provider.dart';
import 'providers/orders_provider.dart';
import 'services/socket_service.dart';
import 'pages/login_page.dart';
import 'pages/home_layout.dart';
import 'pages/splash_screen.dart';
import 'theme/app_theme.dart';
import 'utils/audio_helper.dart';
import 'services/background_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  initAudio();
  await initializeBackgroundService();
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

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _splashTimedOut = false;

  @override
  void initState() {
    super.initState();
    // Guarantee splash screen displays for at least 2.5s for rich branding load
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) {
        setState(() {
          _splashTimedOut = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final showSplash = !authProvider.isInitialized || !_splashTimedOut;
        return MaterialApp(
          scaffoldMessengerKey: scaffoldMessengerKey,
          title: 'DFC Rider',
          theme: AppTheme.lightTheme,
          debugShowCheckedModeBanner: false,
          home: showSplash
              ? const SplashScreen()
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
