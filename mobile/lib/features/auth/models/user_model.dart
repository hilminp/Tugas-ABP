class UserModel {
  final int id;
  final String name;
  final String? username;
  final String? email;
  final String role;
  final bool isPremium;
  final bool isVerified;
  final String? profileImage;
  final String? spesialisasi;
  final double? reviewsAvgRating;
  final int? reviewsCount;

  UserModel({
    required this.id,
    required this.name,
    this.username,
    this.email,
    required this.role,
    this.isPremium = false,
    this.isVerified = false,
    this.profileImage,
    this.spesialisasi,
    this.reviewsAvgRating,
    this.reviewsCount,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // Handle double conversion carefully
    double? rating;
    if (json['reviews_avg_rating'] != null) {
      rating = double.tryParse(json['reviews_avg_rating'].toString());
    }

    return UserModel(
      id: json['id'] is int 
          ? json['id'] as int 
          : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      name: json['name'] as String? ?? 'User',
      username: json['username'] as String?,
      email: json['email'] as String?,
      role: json['role'] as String? ?? 'anonim',
      isPremium: json['is_premium'] == 1 || json['is_premium'] == true || json['is_premium'] == '1',
      isVerified: json['is_verified'] == 1 || json['is_verified'] == true || json['is_verified'] == '1',
      profileImage: json['profile_image'] as String?,
      spesialisasi: json['spesialisasi'] as String?,
      reviewsAvgRating: rating,
      reviewsCount: json['reviews_count'] is int 
          ? json['reviews_count'] as int 
          : int.tryParse(json['reviews_count']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'username': username,
      'email': email,
      'role': role,
      'is_premium': isPremium ? 1 : 0,
      'is_verified': isVerified ? 1 : 0,
      'profile_image': profileImage,
      'spesialisasi': spesialisasi,
      'reviews_avg_rating': reviewsAvgRating,
      'reviews_count': reviewsCount,
    };
  }

  bool get isPsychologist => role == 'psikolog';
}
