import 'dart:io';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../models/post_model.dart';

class FeedService {
  final ApiClient _client = ApiClient();

  // Get posts
  Future<List<PostModel>> getPosts() async {
    try {
      final response = await _client.get('/posts');
      final List<dynamic> data = response.data;
      return data.map((json) => PostModel.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // Create post
  Future<PostModel> createPost(String body, File? imageFile) async {
    try {
      dynamic data;
      if (imageFile != null) {
        String fileName = imageFile.path.split('/').last;
        data = FormData.fromMap({
          'body': body,
          'image': await MultipartFile.fromFile(imageFile.path, filename: fileName),
        });
      } else {
        data = {
          'body': body,
        };
      }

      final response = await _client.post('/posts', data: data);
      return PostModel.fromJson(response.data['post']);
    } catch (e) {
      rethrow;
    }
  }

  // Toggle Like
  Future<Map<String, dynamic>> toggleLike(int id) async {
    try {
      final response = await _client.post('/posts/$id/like');
      return response.data; // { message: String, liked: bool, likes_count: int }
    } catch (e) {
      rethrow;
    }
  }

  // Comment Post
  Future<PostCommentModel> addComment(int id, String content) async {
    try {
      final response = await _client.post('/posts/$id/comment', data: {
        'content': content,
      });
      return PostCommentModel.fromJson(response.data['comment']);
    } catch (e) {
      rethrow;
    }
  }

  // Delete Post
  Future<void> deletePost(int id) async {
    try {
      await _client.delete('/posts/$id');
    } catch (e) {
      rethrow;
    }
  }
}
