import 'dart:io';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../../../core/network/api_client.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  final AuthService _authService = AuthService();
  final ApiClient _apiClient = ApiClient();

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  // Initialize and check auto-login
  Future<void> tryAutoLogin() async {
    _isLoading = true;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');

    if (token == null || token.isEmpty) {
      _isLoading = false;
      notifyListeners();
      return;
    }

    try {
      // Validate token with GET /profile
      final response = await _apiClient.get('/profile');
      _user = UserModel.fromJson(response.data);
    } catch (_) {
      // Clear invalid token
      await prefs.remove('access_token');
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    final result = await _authService.login(email, password);
    
    if (result['success']) {
      final token = result['data']['access_token'];
      final userData = result['data']['user'];
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', token);
      
      _user = UserModel.fromJson(userData);
    }

    _isLoading = false;
    notifyListeners();
    return result;
  }

  // Register Anonim
  Future<Map<String, dynamic>> registerAnonim(
    String email,
    String username,
    String password,
  ) async {
    _isLoading = true;
    notifyListeners();
    
    final result = await _authService.registerAnonim(email, username, password);
    
    _isLoading = false;
    notifyListeners();
    return result;
  }

  // Register Psikolog
  Future<Map<String, dynamic>> registerPsikolog({
    required String email,
    required String username,
    required String password,
    required String spesialisasi,
    required String noRekening,
    required String namaBank,
    required dynamic strFile, // Can be File
    required dynamic ijazahFile, // Can be File
  }) async {
    _isLoading = true;
    notifyListeners();
    
    final result = await _authService.registerPsikolog(
      email: email,
      username: username,
      password: password,
      spesialisasi: spesialisasi,
      noRekening: noRekening,
      namaBank: namaBank,
      strFile: strFile,
      ijazahFile: ijazahFile,
    );
    
    _isLoading = false;
    notifyListeners();
    return result;
  }

  // Appeal Submit
  Future<Map<String, dynamic>> submitAppeal({
    required String email,
    required String password,
    required String reason,
  }) async {
    _isLoading = true;
    notifyListeners();
    final result = await _authService.submitAppeal(email: email, password: password, reason: reason);
    _isLoading = false;
    notifyListeners();
    return result;
  }

  // Reapply
  Future<Map<String, dynamic>> reapply(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    final result = await _authService.reapply(email, password);
    _isLoading = false;
    notifyListeners();
    return result;
  }

  // Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    await _authService.logout();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    _user = null;

    _isLoading = false;
    notifyListeners();
  }

  // Update Profile
  Future<Map<String, dynamic>> updateProfile({
    required String username,
    File? imageFile,
  }) async {
    _isLoading = true;
    notifyListeners();

    final result = await _authService.updateProfile(
      username: username,
      imageFile: imageFile,
    );

    if (result['success'] && result['user'] != null) {
      _user = UserModel.fromJson(result['user']);
    }

    _isLoading = false;
    notifyListeners();
    return result;
  }
}
