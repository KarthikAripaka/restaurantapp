import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _pulseController;
  late AnimationController _loadingController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();

    // 1. Holographic rotating rings controller
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5),
    )..repeat();

    // 2. Pulse controller for logo breathing & glow effect
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _scaleAnimation = Tween<double>(begin: 0.92, end: 1.08).animate(
      CurvedAnimation(
        parent: _pulseController,
        curve: Curves.easeInOutSine,
      ),
    );

    _glowAnimation = Tween<double>(begin: 4.0, end: 20.0).animate(
      CurvedAnimation(
        parent: _pulseController,
        curve: Curves.easeInOutSine,
      ),
    );

    _pulseController.repeat(reverse: true);

    // 4. Horizontal futuristic scanner loading progress bar controller
    _loadingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat(); // Loop scanner loading bar for ongoing background bootstrap
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _pulseController.dispose();
    _loadingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF0F0805), // Deep rich coffee/black
              Color(0xFF261208), // Dark warm copper/burgundy
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Stack(
          children: [
            // Ambient grid pattern overlay for futuristic look
            Positioned.fill(
              child: Opacity(
                opacity: 0.03,
                child: CustomPaint(
                  painter: GridPainter(),
                ),
              ),
            ),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Futuristic holographic badge with rotating rings
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      // Outer clockwise ring
                      RotationTransition(
                        turns: _rotationController,
                        child: CustomPaint(
                          size: const Size(180, 180),
                          painter: HologramRingPainter(
                            color: AppColors.brandOrange.withOpacity(0.3),
                            isClockwise: true,
                          ),
                        ),
                      ),
                      // Inner counter-clockwise ring
                      RotationTransition(
                        turns: Tween<double>(begin: 1.0, end: 0.0).animate(_rotationController),
                        child: CustomPaint(
                          size: const Size(140, 140),
                          painter: HologramRingPainter(
                            color: AppColors.brandRed.withOpacity(0.4),
                            isClockwise: false,
                          ),
                        ),
                      ),
                      // Central pulsing & glowing food/chef logo container
                      AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, child) {
                          return Transform.scale(
                            scale: _scaleAnimation.value,
                            child: Container(
                              width: 90,
                              height: 90,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF1E0E06),
                                border: Border.all(
                                  color: AppColors.brandOrange.withOpacity(0.7),
                                  width: 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.brandOrange.withOpacity(0.25),
                                    blurRadius: _glowAnimation.value,
                                    spreadRadius: 2,
                                  ),
                                  BoxShadow(
                                    color: AppColors.brandRed.withOpacity(0.15),
                                    blurRadius: _glowAnimation.value * 1.5,
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                              child: const Center(
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    // Chef/Food emblem using premium kitchen/food icons
                                    Icon(
                                      Icons.restaurant_menu, // Crossed fork and spoon
                                      color: Color(0xFFF9D423), // Gold yellow
                                      size: 38,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 48),
                  
                  // Brand Name Text
                  AnimatedOpacity(
                    opacity: 1.0,
                    duration: const Duration(milliseconds: 800),
                    child: Column(
                      children: [
                        Text(
                          'DFC',
                          style: TextStyle(
                            fontSize: 42,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 8,
                            color: Colors.white,
                            shadows: [
                              Shadow(
                                color: AppColors.brandOrange.withOpacity(0.6),
                                blurRadius: 10,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'DEVI FOOD COURT',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 4,
                            color: AppColors.ink400.withOpacity(0.9),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'DELIVERY PARTNER',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 2,
                            color: AppColors.brandOrange.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 64),

                  // Horizontal Neon Scanner Progress Indicator
                  AnimatedBuilder(
                    animation: _loadingController,
                    builder: (context, child) {
                      return Column(
                        children: [
                          Container(
                            width: 220,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: Stack(
                              children: [
                                // Glowing cursor scanner line moving back and forth
                                Positioned(
                                  left: (math.sin(_loadingController.value * 2 * math.pi) * 0.4 + 0.5) * 160,
                                  child: Container(
                                    width: 60,
                                    height: 4,
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [
                                          Color(0x00FF4E50),
                                          Color(0xFFFF4E50),
                                          Color(0xFFF9D423),
                                          Color(0x00F9D423),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(2),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(0xFFFF4E50).withOpacity(0.8),
                                          blurRadius: 8,
                                          spreadRadius: 2,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'connecting secure channel...',
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.white.withOpacity(0.35),
                              letterSpacing: 0.5,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Background sci-fi blueprint grids painter
class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.3)
      ..strokeWidth = 0.5;

    const double step = 25.0;

    for (double i = 0; i < size.width; i += step) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double i = 0; i < size.height; i += step) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Holographic dashed circular rings custom painter
class HologramRingPainter extends CustomPainter {
  final Color color;
  final bool isClockwise;

  HologramRingPainter({required this.color, required this.isClockwise});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;

    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    // Draw futuristic dashboard/HUD ring details
    final int sections = isClockwise ? 8 : 12;
    final double sweepAngle = (2 * math.pi) / (sections * 2);

    for (int i = 0; i < sections; i++) {
      final double startAngle = (i * 2 * sweepAngle);
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
      
      // Draw outer tech node markers on rings
      if (i % 3 == 0) {
        final double pointAngle = startAngle;
        final x = center.dx + radius * math.cos(pointAngle);
        final y = center.dy + radius * math.sin(pointAngle);
        canvas.drawCircle(
          Offset(x, y),
          isClockwise ? 2.5 : 1.5,
          Paint()..color = color.withOpacity(0.8)..style = PaintingStyle.fill,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
