import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'register_screen.dart';
import '../providers/auth_provider.dart';
import '../../../core/theme/colors.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  bool _showPassword = false;
  String? _errorMessage;
  
  // Suspension State fields
  bool _isSuspended = false;
  String? _appealStatus;
  String? _adminNotes;
  
  // Re-registration State
  bool _isRejected = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _errorMessage = null;
      _isSuspended = false;
      _isRejected = false;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final result = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (!result['success']) {
      setState(() {
        _errorMessage = result['message'];
        _isSuspended = result['is_suspended'] ?? false;
        _isRejected = result['is_rejected'] ?? false;
        _appealStatus = result['appeal_status'];
        _adminNotes = result['admin_notes'];
      });
    } else {
      // Navigation is handled at main.dart based on auth state
    }
  }

  void _showAppealDialog() {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.white,
        title: const Row(
          children: [
            Icon(Icons.shield_outlined, color: AppColors.primary),
            SizedBox(width: 8),
            Text('Ajukan Banding', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Akun Anda disuspend. Jika Anda merasa ini keliru, berikan alasan mengapa akun Anda harus diaktifkan kembali.',
              style: TextStyle(color: AppColors.textMedium, fontSize: 13),
            ),
            const SizedBox(height: 15),
            TextField(
              controller: reasonController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Tuliskan alasan Anda di sini...',
                fillColor: Colors.grey[50],
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide(color: Colors.grey[200]!),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textMedium)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () async {
              if (reasonController.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              
              final authProvider = Provider.of<AuthProvider>(context, listen: false);
              final result = await authProvider.submitAppeal(
                email: _emailController.text.trim(),
                password: _passwordController.text,
                reason: reasonController.text.trim(),
              );
              
              if (!mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(result['message']),
                  backgroundColor: result['success'] ? AppColors.success : AppColors.error,
                ),
              );
            },
            child: const Text('Kirim Banding', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _handleReapply() async {
    // Show confirmation dialog first
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Daftar Ulang', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Apakah Anda yakin ingin menghapus data lama Anda dan mendaftar ulang sebagai Psikolog?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal', style: TextStyle(color: AppColors.textMedium)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Ya, Lanjutkan', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final result = await authProvider.reapply(_emailController.text.trim(), _passwordController.text);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: result['success'] ? AppColors.success : AppColors.error,
          ),
        );
        if (result['success']) {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen(initialRole: 'psikolog')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = Provider.of<AuthProvider>(context).isLoading;
    
    return Scaffold(
      backgroundColor: AppColors.background,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textDark),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          // Background organic blobs
          Positioned(
            top: -50,
            right: -50,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFFCE9EC).withValues(alpha: 0.6),
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            left: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFFDB2C7).withValues(alpha: 0.3),
              ),
            ),
          ),
          
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  
                  // App Brand Logo Placeholder / Name
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.psychology,
                        size: 64,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  const Center(
                    child: Text(
                      'Curhatin',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const Center(
                    child: Text(
                      'Safe Space to Share Your Burden',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textMedium,
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  // Form Card
                  Card(
                    elevation: 4,
                    shadowColor: AppColors.primary.withValues(alpha: 0.05),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Selamat Datang Kembali',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textDark,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Silakan masuk untuk melanjutkan konsultasi Anda.',
                              style: TextStyle(fontSize: 13, color: AppColors.textMedium),
                            ),
                            const SizedBox(height: 24),
                            
                            // Error message or alert
                            if (_errorMessage != null)
                              Container(
                                padding: const EdgeInsets.all(12),
                                margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF2F2),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFFEE2E2)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _errorMessage!,
                                      style: const TextStyle(color: AppColors.error, fontSize: 13, fontWeight: FontWeight.w500),
                                    ),
                                    if (_isSuspended) ...[
                                      const SizedBox(height: 8),
                                      if (_appealStatus == 'pending')
                                        const Row(
                                          children: [
                                            Icon(Icons.access_time_filled, color: AppColors.warning, size: 16),
                                            SizedBox(width: 6),
                                            Text(
                                              'Banding sedang ditinjau admin...',
                                              style: TextStyle(color: AppColors.warning, fontSize: 12, fontWeight: FontWeight.bold),
                                            ),
                                          ],
                                        )
                                      else if (_appealStatus == 'rejected')
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                                          child: Text(
                                            'Banding Ditolak: "${_adminNotes ?? 'Silakan patuhi panduan.'}"',
                                            style: const TextStyle(color: AppColors.error, fontSize: 11, fontStyle: FontStyle.italic),
                                          ),
                                        )
                                      else
                                        ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.white,
                                            side: const BorderSide(color: AppColors.warning),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                          ),
                                          onPressed: _showAppealDialog,
                                          child: const Text('Ajukan Banding', style: TextStyle(color: AppColors.warning, fontSize: 12)),
                                        ),
                                    ],
                                    if (_isRejected) ...[
                                      const SizedBox(height: 8),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.white,
                                          side: const BorderSide(color: AppColors.error),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                        ),
                                        onPressed: _handleReapply,
                                        child: const Text('Hapus Data & Daftar Ulang', style: TextStyle(color: AppColors.error, fontSize: 12)),
                                      ),
                                    ]
                                  ],
                                ),
                              ),
                            
                            // Email Field
                            TextFormField(
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              decoration: InputDecoration(
                                labelText: 'Alamat Email',
                                hintText: 'name@example.com',
                                prefixIcon: const Icon(Icons.mail_outline, color: AppColors.primary),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide(color: AppColors.secondary.withValues(alpha: 0.5)),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: const BorderSide(color: AppColors.primary, width: 2),
                                ),
                              ),
                              validator: (val) => val == null || !val.contains('@') ? 'Masukkan email yang valid' : null,
                            ),
                            const SizedBox(height: 18),
                            
                            // Password Field
                            TextFormField(
                              controller: _passwordController,
                              obscureText: !_showPassword,
                              decoration: InputDecoration(
                                labelText: 'Kata Sandi',
                                hintText: '••••••••',
                                prefixIcon: const Icon(Icons.lock_outline, color: AppColors.primary),
                                suffixIcon: IconButton(
                                  onPressed: () => setState(() => _showPassword = !_showPassword),
                                  icon: Icon(
                                    _showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                    color: AppColors.textMedium,
                                  ),
                                ),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide(color: AppColors.secondary.withValues(alpha: 0.5)),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: const BorderSide(color: AppColors.primary, width: 2),
                                ),
                              ),
                              validator: (val) => val == null || val.length < 6 ? 'Password minimal 6 karakter' : null,
                            ),
                            const SizedBox(height: 24),
                            
                            // Submit Button with Gradient
                            Container(
                              height: 52,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(16),
                                gradient: isLoading ? null : AppColors.primaryGradient,
                                color: isLoading ? Colors.grey[400] : null,
                                boxShadow: [
                                  if (!isLoading)
                                    BoxShadow(
                                      color: AppColors.primary.withValues(alpha: 0.3),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                ],
                              ),
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                ),
                                onPressed: isLoading ? null : _submit,
                                child: isLoading
                                    ? const SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                      )
                                    : const Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(Icons.login, color: Colors.white),
                                          SizedBox(width: 8),
                                          Text(
                                            'Masuk',
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ],
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // Bottom Links
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Belum punya akun? ',
                        style: TextStyle(color: AppColors.textMedium, fontSize: 13),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const RegisterScreen()),
                          );
                        },
                        child: const Text(
                          'Daftar Sekarang',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
