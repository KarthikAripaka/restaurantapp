import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../theme/app_theme.dart';

class LocationMap extends StatefulWidget {
  final double destLat;
  final double destLng;

  const LocationMap({
    super.key,
    required this.destLat,
    required this.destLng,
  });

  @override
  State<LocationMap> createState() => _LocationMapState();
}

class _LocationMapState extends State<LocationMap> {
  bool _isExpanded = false;
  LatLng? _myPosition;
  StreamSubscription<Position>? _positionSubscription;
  final MapController _mapController = MapController();

  late LatLng _destination;

  @override
  void initState() {
    super.initState();
    _destination = LatLng(widget.destLat, widget.destLng);
  }

  @override
  void dispose() {
    _stopTracking();
    super.dispose();
  }

  Future<void> _toggleMap() async {
    setState(() {
      _isExpanded = !_isExpanded;
    });

    if (_isExpanded) {
      await _startTracking();
    } else {
      _stopTracking();
    }
  }

  Future<void> _startTracking() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint('Location services are disabled.');
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('Location permissions are denied.');
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('Location permissions are permanently denied.');
      return;
    }

    // Get initial position
    try {
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 5),
      );
      if (mounted) {
        setState(() {
          _myPosition = LatLng(pos.latitude, pos.longitude);
        });
        _fitBounds();
      }
    } catch (e) {
      debugPrint('Error getting current position: $e');
    }

    // Subscribe to stream
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).listen((Position position) {
      if (mounted) {
        setState(() {
          _myPosition = LatLng(position.latitude, position.longitude);
        });
        _fitBounds();
      }
    });
  }

  void _stopTracking() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
  }

  void _fitBounds() {
    if (_myPosition == null) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_isExpanded) return;
      try {
        final bounds = LatLngBounds(_myPosition!, _destination);
        _mapController.fitCamera(
          CameraFit.bounds(
            bounds: bounds,
            padding: const EdgeInsets.all(40),
          ),
        );
      } catch (e) {
        debugPrint('Error fitting map bounds: $e');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cream100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.ink900.withOpacity(0.08)),
      ),
      child: Column(
        children: [
          // Expand/collapse button
          InkWell(
            onTap: _toggleMap,
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
              child: DefaultTextStyle(
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink700,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.map, size: 14, color: AppColors.ink700),
                        const SizedBox(width: 6),
                        Text(_isExpanded ? 'Hide map' : 'Show map · follow address'),
                      ],
                    ),
                    Icon(
                      _isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      size: 16,
                      color: AppColors.ink700,
                    ),
                  ],
                ),
              ),
            ),
          ),

          if (_isExpanded)
            Container(
              height: 220,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(8),
                  bottomRight: Radius.circular(8),
                ),
              ),
              clipBehavior: Clip.antiAlias,
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: _destination,
                  initialZoom: 15.0,
                  interactionOptions: const InteractionOptions(
                    flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                  ),
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.dfcrestaurant.rider_app',
                  ),
                  PolylineLayer(
                    polylines: [
                      if (_myPosition != null)
                        Polyline(
                          points: [_myPosition!, _destination],
                          color: AppColors.brandOrange,
                          strokeWidth: 3.0,
                          isDotted: true,
                        ),
                    ],
                  ),
                  MarkerLayer(
                    markers: [
                      // Destination Pin
                      Marker(
                        point: _destination,
                        width: 32,
                        height: 32,
                        child: const Icon(
                          Icons.location_on,
                          color: AppColors.brandRed,
                          size: 32,
                        ),
                      ),
                      // Rider Pin
                      if (_myPosition != null)
                        Marker(
                          point: _myPosition!,
                          width: 20,
                          height: 20,
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.brandOrange,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.brandOrange.withOpacity(0.4),
                                  blurRadius: 6,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
