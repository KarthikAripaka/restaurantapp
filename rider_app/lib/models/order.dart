class OrderLocation {
  final double lat;
  final double lng;

  OrderLocation({required this.lat, required this.lng});

  factory OrderLocation.fromJson(Map<String, dynamic> json) {
    return OrderLocation(
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {'lat': lat, 'lng': lng};
}

class CustomerInfo {
  final String name;
  final String phone;
  final String address;
  final String? landmark;
  final String? notes;
  final OrderLocation? location;

  CustomerInfo({
    required this.name,
    required this.phone,
    required this.address,
    this.landmark,
    this.notes,
    this.location,
  });

  factory CustomerInfo.fromJson(Map<String, dynamic> json) {
    return CustomerInfo(
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      landmark: json['landmark'],
      notes: json['notes'],
      location: json['location'] != null && json['location']['lat'] != null && json['location']['lng'] != null
          ? OrderLocation.fromJson(json['location'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'address': address,
      'landmark': landmark,
      'notes': notes,
      'location': location?.toJson(),
    };
  }
}

class OrderItem {
  final String menuItemId;
  final String name;
  final int quantity;
  final double price;

  OrderItem({
    required this.menuItemId,
    required this.name,
    required this.quantity,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      menuItemId: json['menuItemId'] ?? '',
      name: json['name'] ?? '',
      quantity: json['quantity'] ?? 0,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'menuItemId': menuItemId,
      'name': name,
      'quantity': quantity,
      'price': price,
    };
  }
}

class Order {
  final String id;
  final String orderId;
  final CustomerInfo customer;
  final List<OrderItem> items;
  final double total;
  final String paymentMethod;
  final String paymentStatus;
  final String status;
  final String? assignedRider;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deliveredAt;

  Order({
    required this.id,
    required this.orderId,
    required this.customer,
    required this.items,
    required this.total,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.status,
    this.assignedRider,
    required this.createdAt,
    required this.updatedAt,
    this.deliveredAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    var itemsList = json['items'] as List? ?? [];
    List<OrderItem> parsedItems = itemsList.map((i) => OrderItem.fromJson(i)).toList();

    return Order(
      id: json['_id'] ?? json['id'] ?? '',
      orderId: json['orderId'] ?? '',
      customer: CustomerInfo.fromJson(json['customer'] ?? {}),
      items: parsedItems,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['paymentMethod'] ?? 'cod',
      paymentStatus: json['paymentStatus'] ?? 'pending',
      status: json['status'] ?? 'pending',
      assignedRider: json['assignedRider'] is Map
          ? (json['assignedRider']['_id'] ?? json['assignedRider']['id'])
          : json['assignedRider'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : DateTime.now(),
      deliveredAt: json['deliveredAt'] != null ? DateTime.parse(json['deliveredAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'orderId': orderId,
      'customer': customer.toJson(),
      'items': items.map((i) => i.toJson()).toList(),
      'total': total,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'status': status,
      'assignedRider': assignedRider,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'deliveredAt': deliveredAt?.toIso8601String(),
    };
  }
}
