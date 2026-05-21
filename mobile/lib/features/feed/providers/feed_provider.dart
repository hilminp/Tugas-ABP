import 'dart:io';
import 'package:flutter/material.dart';
import '../models/post_model.dart';
import '../services/feed_service.dart';
import 'package:dio/dio.dart';

class FeedProvider with ChangeNotifier {
  final FeedService _feedService = FeedService();
  
  List<PostModel> _posts = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<PostModel> get posts => _posts;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch posts
  Future<void> fetchPosts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _posts = await _feedService.getPosts();
    } catch (e) {
      _errorMessage = 'Gagal memuat feed. Pastikan koneksi internet aktif.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create new post
  Future<Map<String, dynamic>> createPost(String body, File? imageFile) async {
    _isLoading = true;
    notifyListeners();

    try {
      final newPost = await _feedService.createPost(body, imageFile);
      _posts.insert(0, newPost); // insert at top
      return {'success': true, 'message': 'Postingan berhasil dibagikan.'};
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? 'Gagal membuat postingan.';
      return {'success': false, 'message': msg};
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan sistem.'};
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Toggle Like with Optimistic UI updates
  Future<void> toggleLike(int postId) async {
    final index = _posts.indexWhere((p) => p.id == postId);
    if (index == -index) return;

    final post = _posts[index];
    final originalLiked = post.isLiked;
    final originalCount = post.likesCount;

    // Optimistic Update
    post.isLiked = !post.isLiked;
    post.likesCount += post.isLiked ? 1 : -1;
    notifyListeners();

    try {
      final result = await _feedService.toggleLike(postId);
      // Sync back with response just in case
      post.isLiked = result['liked'];
      post.likesCount = result['likes_count'];
      notifyListeners();
    } catch (e) {
      // Revert on error
      post.isLiked = originalLiked;
      post.likesCount = originalCount;
      notifyListeners();
    }
  }

  // Add Comment
  Future<Map<String, dynamic>> addComment(int postId, String content) async {
    try {
      final comment = await _feedService.addComment(postId, content);
      
      final index = _posts.indexWhere((p) => p.id == postId);
      if (index != -1) {
        _posts[index].comments.insert(0, comment);
        _posts[index].commentsCount += 1;
        notifyListeners();
      }
      return {'success': true, 'comment': comment};
    } on DioException catch (e) {
      return {'success': false, 'message': e.response?.data['message'] ?? 'Gagal mengirim komentar.'};
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan.'};
    }
  }

  // Delete Post
  Future<Map<String, dynamic>> deletePost(int postId) async {
    final index = _posts.indexWhere((p) => p.id == postId);
    if (index == -1) return {'success': false, 'message': 'Post tidak ditemukan'};
    
    final removedPost = _posts[index];
    _posts.removeAt(index);
    notifyListeners();

    try {
      await _feedService.deletePost(postId);
      return {'success': true, 'message': 'Postingan berhasil dihapus.'};
    } catch (e) {
      // Revert if error
      _posts.insert(index, removedPost);
      notifyListeners();
      return {'success': false, 'message': 'Gagal menghapus postingan.'};
    }
  }
}
