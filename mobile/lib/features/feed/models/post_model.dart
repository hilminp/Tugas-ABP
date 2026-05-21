import '../../auth/models/user_model.dart';

class PostModel {
  final int id;
  final String body;
  final String? image;
  final UserModel user;
  int likesCount;
  int commentsCount;
  bool isLiked;
  final String createdAt;
  final List<PostCommentModel> comments;

  PostModel({
    required this.id,
    required this.body,
    this.image,
    required this.user,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.isLiked = false,
    required this.createdAt,
    required this.comments,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    var commentsList = json['comments'] as List? ?? [];
    List<PostCommentModel> parsedComments = commentsList
        .map((c) => PostCommentModel.fromJson(c as Map<String, dynamic>))
        .toList();

    return PostModel(
      id: json['id'] is int 
          ? json['id'] as int 
          : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      body: json['body'] as String? ?? '',
      image: json['image'] as String?,
      user: json['user'] != null 
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : UserModel(id: 0, name: 'Unknown User', role: 'anonim'),
      likesCount: json['likes_count'] is int 
          ? json['likes_count'] as int 
          : int.tryParse(json['likes_count']?.toString() ?? '') ?? 0,
      commentsCount: json['comments_count'] is int 
          ? json['comments_count'] as int 
          : int.tryParse(json['comments_count']?.toString() ?? '') ?? 0,
      isLiked: json['is_liked'] == true || json['is_liked'] == 1 || json['is_liked'] == '1',
      createdAt: json['created_at']?.toString() ?? '',
      comments: parsedComments,
    );
  }
}

class PostCommentModel {
  final int id;
  final String content;
  final UserModel user;
  final String createdAt;

  PostCommentModel({
    required this.id,
    required this.content,
    required this.user,
    required this.createdAt,
  });

  factory PostCommentModel.fromJson(Map<String, dynamic> json) {
    return PostCommentModel(
      id: json['id'] is int 
          ? json['id'] as int 
          : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      content: json['content'] as String? ?? '',
      user: json['user'] != null 
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : UserModel(id: 0, name: 'Unknown User', role: 'anonim'),
      createdAt: json['created_at']?.toString() ?? '',
    );
  }
}
