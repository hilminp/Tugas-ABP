
class MessageModel {
  final int id;
  final int senderId;
  final int recipientId;
  final String? body;
  final String? image;
  final String createdAt;

  MessageModel({
    required this.id,
    required this.senderId,
    required this.recipientId,
    this.body,
    this.image,
    required this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id'] is int 
          ? json['id'] as int 
          : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      senderId: json['sender_id'] is int 
          ? json['sender_id'] as int 
          : int.tryParse(json['sender_id']?.toString() ?? '') ?? 0,
      recipientId: json['recipient_id'] is int 
          ? json['recipient_id'] as int 
          : int.tryParse(json['recipient_id']?.toString() ?? '') ?? 0,
      body: json['body'] as String?,
      image: json['image'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sender_id': senderId,
      'recipient_id': recipientId,
      'body': body,
      'image': image,
      'created_at': createdAt,
    };
  }
}
