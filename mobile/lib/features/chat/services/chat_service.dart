import 'dart:io';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../auth/models/user_model.dart';
import '../models/message_model.dart';

class ChatService {
  final ApiClient _client = ApiClient();

  // Get active chat friends/rooms
  Future<List<UserModel>> getChats() async {
    try {
      final response = await _client.get('/messages');
      final List<dynamic> friendsData = response.data['friends'] ?? [];
      return friendsData.map((json) => UserModel.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // Get specific message thread
  Future<Map<String, dynamic>> getThread(int friendId) async {
    try {
      final response = await _client.get('/messages/$friendId');
      final List<dynamic> msgData = response.data['messages'] ?? [];
      final list = msgData.map((json) => MessageModel.fromJson(json)).toList();
      
      return {
        'messages': list,
        'friend': UserModel.fromJson(response.data['friend']),
        'is_locked': response.data['is_locked'] ?? false,
        'lock_message': response.data['lock_message'] ?? '',
      };
    } catch (e) {
      rethrow;
    }
  }

  // Send message
  Future<MessageModel> sendMessage(int friendId, String? body, File? imageFile) async {
    try {
      dynamic data;
      if (imageFile != null) {
        String fileName = imageFile.path.split('/').last;
        data = FormData.fromMap({
          if (body != null && body.trim().isNotEmpty) 'body': body,
          'image': await MultipartFile.fromFile(imageFile.path, filename: fileName),
        });
      } else {
        data = {
          'body': body,
        };
      }

      final response = await _client.post('/messages/$friendId', data: data);
      return MessageModel.fromJson(response.data['msg']);
    } catch (e) {
      rethrow;
    }
  }
}
