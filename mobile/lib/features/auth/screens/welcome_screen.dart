import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  void _showLegalDialog(BuildContext context, String type) {
    String title = '';
    String body = '';

    switch (type) {
      case 'privacy':
        title = 'Privacy Policy';
        body = 'Kami menjaga kerahasiaan data pengguna. Informasi personal hanya digunakan untuk kebutuhan layanan dan keamanan akun, tidak dibagikan ke pihak lain tanpa izin pengguna.';
        break;
      case 'terms':
        title = 'Terms of Service';
        body = 'Dengan menggunakan Curhatin, pengguna setuju menggunakan platform secara bertanggung jawab, tidak melakukan penyalahgunaan, dan mematuhi aturan komunitas untuk menjaga kenyamanan bersama.';
        break;
      case 'safety':
        title = 'Safety Guidelines';
        body = 'Dilarang menyebarkan ujaran kebencian, ancaman, atau konten berbahaya. Jika menemukan pelanggaran, segera lapor ke admin agar kami bisa menindaklanjuti dengan cepat.';
        break;
      case 'contact':
        title = 'Contact';
        body = 'Butuh bantuan? Hubungi tim Curhatin melalui email support@curhatin.app atau melalui admin panel. Kami akan membantu secepat mungkin.';
        break;
    }

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            const Icon(Icons.info_outline, color: AppColors.primary),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        content: Text(
          body,
          style: const TextStyle(
            color: AppColors.textMedium,
            fontSize: 14,
            height: 1.5,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Tutup',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.15),
          width: 1,
        ),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: AppColors.primary,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background blobs
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFFCE9EC).withValues(alpha: 0.6),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -80,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFFDB2C7).withValues(alpha: 0.25),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 20),
                  // Logo and Title
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.psychology,
                          color: AppColors.primary,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Curhatin',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textDark,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Chip List
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildChip('Anonim'),
                      _buildChip('Psikolog'),
                      _buildChip('Privat'),
                      _buildChip('No Judgement'),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // Headline
                  Text.rich(
                    TextSpan(
                      text: 'Kamu nggak sendirian koq,\n',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textDark,
                        height: 1.3,
                      ),
                      children: [
                        TextSpan(
                          text: 'curhat di sini.',
                          style: TextStyle(
                            color: AppColors.accent,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),

                  // Sub-description
                  const Text(
                    'Ruang aman untuk berbagi perasaan tanpa judgement. Sepenuhnya gratis dan anonim.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: AppColors.textMedium,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Primary CTA Button
                  Container(
                    height: 52,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: AppColors.primaryGradient,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      child: const Text(
                        'Mulai Curhat Sekarang',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Proof / Avatar Stack Row
                  Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: 80,
                          height: 36,
                          child: Stack(
                            children: [
                              Positioned(
                                left: 0,
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                  ),
                                  child: const CircleAvatar(
                                    radius: 16,
                                    backgroundImage: NetworkImage(
                                      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_vxHYnkKt7qtoedtJNGyx278hPe7UWSzRZZZjW2o9WvtWNK_koNVyyyY4-Wgj2_20INB8V567K4zZHfMI75xKQ-u2O6QnpClbW_9Iw4SMdyclw2byC8rRSvTdhlS3fXiligRbukOtHiV2gjw44Hw4VMePa6bbJOJKP_xQ9zgzN_LK9oyCG48QRLnxuQsGfB5FHnSX1btLhhGmtVYQuPqP8Y3rdPgnzsC8f_bPl76PEtyfGXXIbK91fPq4COZhe_RH3SBXLatoH2U',
                                    ),
                                  ),
                                ),
                              ),
                              Positioned(
                                left: 18,
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                  ),
                                  child: const CircleAvatar(
                                    radius: 16,
                                    backgroundImage: NetworkImage(
                                      'https://lh3.googleusercontent.com/aida-public/AB6AXuAAk_yrID_eHckObppOvNhoTqE9XtCAlTjXkko2VeXiClkSLUxCbjyhp6xCk5NdPyPftNm07qoLOdeEe0oVBoInwzlEGOVvACGgTNQW48dWSNkXPUnzDNdpIO2VH8JdQRnQSsJRFIiROZCFmqzd0tDQBMLOe2b9yfJwL8FTYefecMo-SseI3WTIgOnuOPCOGnnenvIY3URzJzpDTy8W4FJoNNhwfrOSqkT5qf_xQ_KjNsrWUJruCQA4AxdEvHYkJKrACqOVYHbGUVM',
                                    ),
                                  ),
                                ),
                              ),
                              Positioned(
                                left: 36,
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                  ),
                                  child: const CircleAvatar(
                                    radius: 16,
                                    backgroundImage: NetworkImage(
                                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCDutOOj5O80hi9b-HJbRXQ6awtQXB42AQajm3Lsyt4mpjGvR2PMlAOktuFg6Yk9XpKB9-G76AKLkRgFAqdTFNdRYDLYXMVqFbh5W4XoBhxD7h1KRAJHxF_rlcgikqW057XlD8L7C345tq53gcmaMFS6ZNaUkojoiE80dxTpqN0Q4DRfgcvyZGgh1PtK5roKIUJers5V-yW_k5MaCUmk2BQQlS_e_sxzmf9QkjMb5hqi6HLL7ASXuzSlNERNhYHHzvGoxvaRYM-1_M',
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text.rich(
                          TextSpan(
                            text: '12,000+ ',
                            style: TextStyle(
                              color: AppColors.textDark,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                            children: [
                              TextSpan(
                                text: 'orang telah berbagi hari ini.',
                                style: TextStyle(
                                  color: AppColors.textMedium,
                                  fontWeight: FontWeight.normal,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Mulai Berbagi Sekarang Card
                  Card(
                    elevation: 4,
                    shadowColor: AppColors.primary.withValues(alpha: 0.08),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 4,
                                height: 20,
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'Mulai Berbagi Sekarang',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textDark,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Buka hatimu tanpa rasa takut. Platform kami didesain khusus untuk menjaga privasi Anda seutuhnya melalui teknologi anonimitas tercanggih.',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textMedium,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                                    );
                                  },
                                  child: const Text(
                                    'Masuk',
                                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: AppColors.primary, width: 1.5),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                    );
                                  },
                                  child: const Text(
                                    'Daftar',
                                    style: TextStyle(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.shield_outlined,
                                color: AppColors.primary.withValues(alpha: 0.7),
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Data Terenkripsi & Anonim',
                                style: TextStyle(
                                  color: AppColors.primary.withValues(alpha: 0.8),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Footer Section
                  Column(
                    children: [
                      const Text(
                        '© 2026 Curhatin. Kisahmu adalah prioritas kami.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.textMedium,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        alignment: WrapAlignment.center,
                        spacing: 16,
                        runSpacing: 8,
                        children: [
                          GestureDetector(
                            onTap: () => _showLegalDialog(context, 'privacy'),
                            child: const Text(
                              'Privacy Policy',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => _showLegalDialog(context, 'terms'),
                            child: const Text(
                              'Terms of Service',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => _showLegalDialog(context, 'safety'),
                            child: const Text(
                              'Safety Guidelines',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => _showLegalDialog(context, 'contact'),
                            child: const Text(
                              'Contact',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
