
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
      id: json['id'] as int,
      senderId: json['sender_id'] as int,
      recipientId: json['recipient_id'] as int,
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
