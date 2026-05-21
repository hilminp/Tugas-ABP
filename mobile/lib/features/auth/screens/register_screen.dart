import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../../../core/theme/colors.dart';

class RegisterScreen extends StatefulWidget {
  final String? initialRole;
  const RegisterScreen({super.key, this.initialRole});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Role selector: 'anonim' or 'psikolog'
  late String _selectedRole;

  // Shared inputs
  final _emailController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  
  // Psychologist specific inputs
  final _spesialisasiController = TextEditingController();
  final _rekeningController = TextEditingController();
  final _bankController = TextEditingController();
  
  // Dummy file paths for demonstration (simulate picking STR & Ijazah files)
  File? _strFile;
  File? _ijazahFile;
  
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.initialRole ?? 'anonim';
  }

  @override
  void dispose() {
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _spesialisasiController.dispose();
    _rekeningController.dispose();
    _bankController.dispose();
    super.dispose();
  }

  // Simulate file picking
  void _pickStrFile() {
    // For complete implementation, import 'package:file_picker/file_picker.dart'
    // Here we simulate picking a dummy file
    setState(() {
      _strFile = File('/dummy_path/str_file.pdf');
    });
  }

  void _pickIjazahFile() {
    setState(() {
      _ijazahFile = File('/dummy_path/ijazah_file.pdf');
    });
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    // Validate files for psychologist registration
    if (_selectedRole == 'psikolog' && (_strFile == null || _ijazahFile == null)) {
      setState(() {
        _errorMessage = 'File STR dan Ijazah wajib diunggah.';
      });
      return;
    }

    setState(() {
      _errorMessage = null;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    Map<String, dynamic> result;
    
    if (_selectedRole == 'anonim') {
      result = await authProvider.registerAnonim(
        _emailController.text.trim(),
        _usernameController.text.trim(),
        _passwordController.text,
      );
    } else {
      result = await authProvider.registerPsikolog(
        email: _emailController.text.trim(),
        username: _usernameController.text.trim(),
        password: _passwordController.text,
        spesialisasi: _spesialisasiController.text.trim(),
        noRekening: _rekeningController.text.trim(),
        namaBank: _bankController.text.trim(),
        strFile: _strFile!,
        ijazahFile: _ijazahFile!,
      );
    }

    if (result['success']) {
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Text('Registrasi Berhasil!', style: TextStyle(fontWeight: FontWeight.bold)),
            content: Text(result['message']),
            actions: [
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                onPressed: () {
                  Navigator.pop(ctx); // Close dialog
                  Navigator.pop(context); // Back to login screen
                },
                child: const Text('Ke Halaman Login', style: TextStyle(color: Colors.white)),
              )
            ],
          ),
        );
      }
    } else {
      setState(() {
        _errorMessage = result['message'];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = Provider.of<AuthProvider>(context).isLoading;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textDark),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Buat Akun Baru',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Silakan pilih tipe akun dan lengkapi data Anda.',
              style: TextStyle(fontSize: 13, color: AppColors.textMedium),
            ),
            const SizedBox(height: 24),

            // Tab Role Selector
            Container(
              height: 50,
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.secondary.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedRole = 'anonim'),
                      child: Container(
                        decoration: BoxDecoration(
                          color: _selectedRole == 'anonim' ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            if (_selectedRole == 'anonim')
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              )
                          ],
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'Teman Curhat (Anonim)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: _selectedRole == 'anonim' ? AppColors.primary : AppColors.textMedium,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedRole = 'psikolog'),
                      child: Container(
                        decoration: BoxDecoration(
                          color: _selectedRole == 'psikolog' ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            if (_selectedRole == 'psikolog')
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              )
                          ],
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'Psikolog Profesional',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: _selectedRole == 'psikolog' ? AppColors.primary : AppColors.textMedium,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Form Fields
            Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_errorMessage != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFEE2E2)),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: AppColors.error, fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ),

                  // Email
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: 'Alamat Email',
                      hintText: 'name@example.com',
                      prefixIcon: const Icon(Icons.mail_outline, color: AppColors.primary),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    validator: (val) => val == null || !val.contains('@') ? 'Masukkan email yang valid' : null,
                  ),
                  const SizedBox(height: 16),

                  // Username
                  TextFormField(
                    controller: _usernameController,
                    decoration: InputDecoration(
                      labelText: 'Nama Pengguna (Username)',
                      hintText: 'alex123',
                      prefixIcon: const Icon(Icons.person_outline, color: AppColors.primary),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Username tidak boleh kosong' : null,
                  ),
                  const SizedBox(height: 16),

                  // Password
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Kata Sandi',
                      hintText: '••••••••',
                      prefixIcon: const Icon(Icons.lock_outline, color: AppColors.primary),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    validator: (val) => val == null || val.length < 6 ? 'Password minimal 6 karakter' : null,
                  ),

                  // Dynamic Psychologist fields
                  if (_selectedRole == 'psikolog') ...[
                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 12),
                    const Text(
                      'Informasi Profesional & Legal',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textDark),
                    ),
                    const SizedBox(height: 16),

                    // Spesialisasi
                    TextFormField(
                      controller: _spesialisasiController,
                      decoration: InputDecoration(
                        labelText: 'Spesialisasi Kategori',
                        hintText: 'e.g. kesehatan_mental, kecemasan_stres',
                        prefixIcon: const Icon(Icons.category_outlined, color: AppColors.primary),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      validator: (val) => _selectedRole == 'psikolog' && (val == null || val.trim().isEmpty)
                          ? 'Wajib diisi'
                          : null,
                    ),
                    const SizedBox(height: 16),

                    // Nama Bank
                    TextFormField(
                      controller: _bankController,
                      decoration: InputDecoration(
                        labelText: 'Nama Bank',
                        hintText: 'BCA, Mandiri, BRI...',
                        prefixIcon: const Icon(Icons.account_balance_outlined, color: AppColors.primary),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      validator: (val) => _selectedRole == 'psikolog' && (val == null || val.trim().isEmpty)
                          ? 'Wajib diisi'
                          : null,
                    ),
                    const SizedBox(height: 16),

                    // Nomor Rekening
                    TextFormField(
                      controller: _rekeningController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Nomor Rekening',
                        hintText: '1234567890',
                        prefixIcon: const Icon(Icons.credit_card_outlined, color: AppColors.primary),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      validator: (val) => _selectedRole == 'psikolog' && (val == null || val.trim().isEmpty)
                          ? 'Wajib diisi'
                          : null,
                    ),
                    const SizedBox(height: 20),

                    // Upload STR File Simulation
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              side: const BorderSide(color: AppColors.primary),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: _pickStrFile,
                            icon: const Icon(Icons.upload_file, color: AppColors.primary),
                            label: const Text('Unggah STR (.pdf/jpg)', style: TextStyle(color: AppColors.primary)),
                          ),
                        ),
                        if (_strFile != null)
                          const Padding(
                            padding: EdgeInsets.only(left: 8.0),
                            child: Icon(Icons.check_circle, color: AppColors.success),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Upload Ijazah File Simulation
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              side: const BorderSide(color: AppColors.primary),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: _pickIjazahFile,
                            icon: const Icon(Icons.upload_file, color: AppColors.primary),
                            label: const Text('Unggah Ijazah (.pdf/jpg)', style: TextStyle(color: AppColors.primary)),
                          ),
                        ),
                        if (_ijazahFile != null)
                          const Padding(
                            padding: EdgeInsets.only(left: 8.0),
                            child: Icon(Icons.check_circle, color: AppColors.success),
                          ),
                      ],
                    ),
                  ],

                  const SizedBox(height: 32),

                  // Submit Button
                  Container(
                    height: 52,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: isLoading ? null : AppColors.primaryGradient,
                      color: isLoading ? Colors.grey[400] : null,
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
                          : const Text(
                              'Daftar Sekarang',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
