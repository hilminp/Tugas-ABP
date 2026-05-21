import 'dart:io';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';

class AuthService {
  final ApiClient _client = ApiClient();

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _client.post('/login', data: {
        'email': email,
        'password': password,
      });
      return {
        'success': true,
        'data': response.data,
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Login gagal.',
        'is_suspended': e.response?.data['is_suspended'] == true,
        'is_rejected': e.response?.data['is_rejected'] == true,
        'appeal_status': e.response?.data['appeal_status'],
        'admin_notes': e.response?.data['admin_notes'],
      };
    }
  }

  // Register Anonim
  Future<Map<String, dynamic>> registerAnonim(
    String email,
    String username,
    String password,
  ) async {
    try {
      final response = await _client.post('/register/anonim', data: {
        'email': email,
        'username': username,
        'password': password,
        'password_confirmation': password, // match Laravel confirmation
      });
      return {
        'success': true,
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Registrasi gagal.',
      };
    }
  }

  // Register Psikolog (Requires File Upload)
  Future<Map<String, dynamic>> registerPsikolog({
    required String email,
    required String username,
    required String password,
    required String spesialisasi,
    required String noRekening,
    required String namaBank,
    required File strFile,
    required File ijazahFile,
  }) async {
    try {
      String strFileName = strFile.path.split('/').last;
      String ijazahFileName = ijazahFile.path.split('/').last;

      FormData formData = FormData.fromMap({
        'email': email,
        'username': username,
        'password': password,
        'password_confirmation': password,
        'spesialisasi': spesialisasi,
        'no_rekening': noRekening,
        'nama_bank': namaBank,
        'str_file': await MultipartFile.fromFile(strFile.path, filename: strFileName),
        'ijazah_file': await MultipartFile.fromFile(ijazahFile.path, filename: ijazahFileName),
      });

      final response = await _client.post(
        '/register/psikolog',
        data: formData,
        queryParameters: {},
      );

      return {
        'success': true,
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Registrasi psikolog gagal.',
      };
    }
  }

  // Submit Appeal
  Future<Map<String, dynamic>> submitAppeal({
    required String email,
    required String password,
    required String reason,
  }) async {
    try {
      final response = await _client.post('/appeals/submit', data: {
        'email': email,
        'password': password,
        'reason': reason,
      });
      return {
        'success': true,
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal mengirim banding.',
      };
    }
  }

  // Reapply (Delete rejected account and let user re-register)
  Future<Map<String, dynamic>> reapply(String email, String password) async {
    try {
      final response = await _client.post('/reapply', data: {
        'email': email,
        'password': password,
      });
      return {
        'success': true,
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal memproses pendaftaran ulang.',
      };
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _client.post('/logout');
    } catch (_) {
      // Ignored since we're clearing the session locally anyway
    }
  }

  // Update Profile
  Future<Map<String, dynamic>> updateProfile({
    required String username,
    File? imageFile,
  }) async {
    try {
      Map<String, dynamic> dataMap = {
        'username': username,
      };

      if (imageFile != null) {
        String fileName = imageFile.path.split('/').last;
        dataMap['profile_image'] = await MultipartFile.fromFile(
          imageFile.path,
          filename: fileName,
        );
      }

      FormData formData = FormData.fromMap(dataMap);

      final response = await _client.post(
        '/profile/update',
        data: formData,
      );

      return {
        'success': true,
        'message': response.data['message'] ?? 'Profil berhasil diperbarui.',
        'user': response.data['user'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal memperbarui profil.',
      };
    }
  }
}
