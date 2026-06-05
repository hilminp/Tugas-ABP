import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:google_fonts/google_fonts.dart';
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
  String? _selectedSpesialisasi;
  final _rekeningController = TextEditingController();
  String? _selectedBank;
  
  // Dummy file paths for demonstration (simulate picking STR & Ijazah files)
  File? _strFile;
  String? _strFileName;
  File? _ijazahFile;
  String? _ijazahFileName;
  bool _agreeToTerms = false;
  
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
    _rekeningController.dispose();
    super.dispose();
  }

  void _showTermsAndConditionsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Syarat & Ketentuan Psikolog', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Dengan mendaftar sebagai Psikolog, Anda menyetujui:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              SizedBox(height: 12),
              Text('1. Anda adalah psikolog profesional dengan STR yang sah dan masih berlaku.', style: TextStyle(fontSize: 13)),
              SizedBox(height: 6),
              Text('2. Data, identitas, dan dokumen (STR & Ijazah) yang dilampirkan adalah benar dan dapat dipertanggungjawabkan.', style: TextStyle(fontSize: 13)),
              SizedBox(height: 6),
              Text('3. Bersedia memberikan layanan konsultasi sesuai standar dan kode etik psikologi.', style: TextStyle(fontSize: 13)),
              SizedBox(height: 6),
              Text('4. Curhatin berhak memverifikasi dan menolak atau menangguhkan akun jika ditemukan pelanggaran.', style: TextStyle(fontSize: 13)),
              SizedBox(height: 6),
              Text('5. Menjaga penuh kerahasiaan identitas dan sesi pasien/klien.', style: TextStyle(fontSize: 13)),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Mengerti', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _pickStrFile() async {
    final result = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        _strFile = File(result.files.single.path!);
        _strFileName = result.files.single.name;
      });
    }
  }

  Future<void> _pickIjazahFile() async {
    final result = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        _ijazahFile = File(result.files.single.path!);
        _ijazahFileName = result.files.single.name;
      });
    }
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    // Validate files for psychologist registration
    if (_selectedRole == 'psikolog') {
      if (_strFile == null || _ijazahFile == null) {
        setState(() {
          _errorMessage = 'File STR dan Ijazah wajib diunggah.';
        });
        return;
      }
      if (!_agreeToTerms) {
        setState(() {
          _errorMessage = 'Anda harus menyetujui Syarat dan Ketentuan.';
        });
        return;
      }
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
        spesialisasi: _selectedSpesialisasi ?? '',
        noRekening: _rekeningController.text.trim(),
        namaBank: _selectedBank ?? '',
        strFile: _strFile!,
        ijazahFile: _ijazahFile!,
        strFileName: _strFileName,
        ijazahFileName: _ijazahFileName,
      );
    }

    if (result['success']) {
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Text('Registrasi Berhasil!', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold)),
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
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textDark),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFFFAECE9),
              Color(0xFFEED4D4),
              Color(0xFFCCA2A7),
              Color(0xFFDCAAB2),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
             Text(
               'Buat Akun Baru',
               style: GoogleFonts.plusJakartaSans(
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
                     Text(
                       'Informasi Profesional & Legal',
                       style: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textDark),
                     ),
                    const SizedBox(height: 16),

                    // Spesialisasi
                    DropdownButtonFormField<String>(
                      value: _selectedSpesialisasi,
                      decoration: InputDecoration(
                        labelText: 'Spesialisasi Kategori',
                        prefixIcon: const Icon(Icons.category_outlined, color: AppColors.primary),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'kesehatan_mental', child: Text('Kesehatan Mental')),
                        DropdownMenuItem(value: 'kecemasan_stres', child: Text('Kecemasan & Stres')),
                        DropdownMenuItem(value: 'hubungan_percintaan', child: Text('Hubungan & Percintaan')),
                        DropdownMenuItem(value: 'keluarga', child: Text('Keluarga')),
                        DropdownMenuItem(value: 'sosial_pertemanan', child: Text('Sosial & Pertemanan')),
                      ],
                      onChanged: (val) {
                        setState(() {
                          _selectedSpesialisasi = val;
                        });
                      },
                      validator: (val) => _selectedRole == 'psikolog' && (val == null || val.isEmpty)
                          ? 'Wajib dipilih'
                          : null,
                    ),
                    const SizedBox(height: 16),

                    // Nama Bank
                    DropdownButtonFormField<String>(
                      value: _selectedBank,
                      decoration: InputDecoration(
                        labelText: 'Nama Bank',
                        prefixIcon: const Icon(Icons.account_balance_outlined, color: AppColors.primary),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'BCA', child: Text('Bank Central Asia (BCA)')),
                        DropdownMenuItem(value: 'MANDIRI', child: Text('Bank Mandiri')),
                        DropdownMenuItem(value: 'BNI', child: Text('Bank Negara Indonesia (BNI)')),
                        DropdownMenuItem(value: 'BRI', child: Text('Bank Rakyat Indonesia (BRI)')),
                        DropdownMenuItem(value: 'CIMB', child: Text('CIMB Niaga')),
                        DropdownMenuItem(value: 'BSI', child: Text('Bank Syariah Indonesia (BSI)')),
                        DropdownMenuItem(value: 'DANAMON', child: Text('Bank Danamon')),
                        DropdownMenuItem(value: 'PERMATA', child: Text('Bank Permata')),
                        DropdownMenuItem(value: 'MAYBANK', child: Text('Maybank Indonesia')),
                        DropdownMenuItem(value: 'BTN', child: Text('Bank Tabungan Negara (BTN)')),
                      ],
                      onChanged: (val) {
                        setState(() {
                          _selectedBank = val;
                        });
                      },
                      validator: (val) => _selectedRole == 'psikolog' && (val == null || val.isEmpty)
                          ? 'Wajib dipilih'
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
                    const SizedBox(height: 24),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: _agreeToTerms,
                            activeColor: AppColors.primary,
                            onChanged: (val) {
                              setState(() {
                                _agreeToTerms = val ?? false;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => _showTermsAndConditionsDialog(context),
                            child: RichText(
                              text: const TextSpan(
                                style: TextStyle(fontSize: 12, color: AppColors.textMedium, fontFamily: 'Plus Jakarta Sans'),
                                children: [
                                  TextSpan(text: 'Saya menyetujui '),
                                  TextSpan(
                                    text: 'Syarat & Ketentuan serta Kebijakan Privasi',
                                    style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                                  ),
                                  TextSpan(text: ' yang berlaku untuk Psikolog di Curhatin.'),
                                ],
                              ),
                            ),
                          ),
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
    ),
  ),
);
}
}
