import 'dart:io';
import 'package:flutter/material.dart';
import '../../auth/models/user_model.dart';
import '../models/message_model.dart';
import '../services/chat_service.dart';

class ChatProvider with ChangeNotifier {
  final ChatService _chatService = ChatService();

  List<UserModel> _chats = [];
  List<MessageModel> _messages = [];
  UserModel? _activeFriend;
  bool _isLocked = false;
  String _lockMessage = '';

  bool _isLoadingChats = false;
  bool _isLoadingMessages = false;

  List<UserModel> get chats => _chats;
  List<MessageModel> get messages => _messages;
  UserModel? get activeFriend => _activeFriend;
  bool get isLocked => _isLocked;
  String get lockMessage => _lockMessage;

  bool get isLoadingChats => _isLoadingChats;
  bool get isLoadingMessages => _isLoadingMessages;

  // Fetch all chats
  Future<void> fetchChats() async {
    _isLoadingChats = true;
    notifyListeners();
    try {
      _chats = await _chatService.getChats();
    } catch (_) {
      _chats = [];
    } finally {
      _isLoadingChats = false;
      notifyListeners();
    }
  }

  // Fetch thread messages
  Future<void> fetchMessages(int friendId) async {
    _isLoadingMessages = true;
    notifyListeners();
    try {
      final result = await _chatService.getThread(friendId);
      _messages = result['messages'];
      _activeFriend = result['friend'];
      _isLocked = result['is_locked'];
      _lockMessage = result['lock_message'];
    } catch (_) {
      _messages = [];
      _isLocked = true;
      _lockMessage = 'Gagal memuat pesan.';
    } finally {
      _isLoadingMessages = false;
      notifyListeners();
    }
  }

  // Polling helper (refresh message thread without loading indicator)
  Future<void> refreshMessages(int friendId) async {
    try {
      final result = await _chatService.getThread(friendId);
      _messages = result['messages'];
      _isLocked = result['is_locked'];
      _lockMessage = result['lock_message'];
      notifyListeners();
    } catch (_) {}
  }

  // Send message
  Future<Map<String, dynamic>> sendMessage(int friendId, String? body, File? imageFile) async {
    try {
      final newMsg = await _chatService.sendMessage(friendId, body, imageFile);
      _messages.add(newMsg);
      notifyListeners();
      return {'success': true};
    } catch (e) {
      return {'success': false, 'message': 'Gagal mengirim pesan.'};
    }
  }
}
