class Rider {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String? vehicleNumber;
  final bool active;
  final int totalDeliveries;

  Rider({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    this.vehicleNumber,
    required this.active,
    required this.totalDeliveries,
  });

  factory Rider.fromJson(Map<String, dynamic> json) {
    return Rider(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      vehicleNumber: json['vehicleNumber'],
      active: json['active'] ?? false,
      totalDeliveries: json['totalDeliveries'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'vehicleNumber': vehicleNumber,
      'active': active,
      'totalDeliveries': totalDeliveries,
    };
  }
}
