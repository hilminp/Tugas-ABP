import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/colors.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    // Staggered intervals for elements to slide up and fade in smoothly
    _animations = List.generate(5, (index) {
      final start = index * 0.15;
      final end = (start + 0.35).clamp(0.0, 1.0);
      return Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Interval(start, end, curve: Curves.easeOutCubic),
        ),
      );
    });

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

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
              style: GoogleFonts.plusJakartaSans(
                color: AppColors.textDark,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        content: Text(
          body,
          style: GoogleFonts.manrope(
            color: AppColors.textMedium,
            fontSize: 14,
            height: 1.5,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Tutup',
              style: GoogleFonts.manrope(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
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
        child: Stack(
          children: [
            // Background soft aesthetic blobs
            Positioned(
              top: -100,
              right: -100,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFFCE9EC).withValues(alpha: 0.4),
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
                  color: const Color(0xFFFDB2C7).withValues(alpha: 0.15),
                ),
              ),
            ),
            SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight,
                      ),
                      child: IntrinsicHeight(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const SizedBox(height: 15),
                              // Logo and Title (Animated: index 0)
                              AnimatedBuilder(
                                animation: _animations[0],
                                builder: (context, child) {
                                  return Opacity(
                                    opacity: _animations[0].value,
                                    child: Transform.translate(
                                      offset: Offset(0, 15 * (1 - _animations[0].value)),
                                      child: child,
                                    ),
                                  );
                                },
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Image.asset(
                                      'assets/images/LogoFinal.png',
                                      width: 38,
                                      height: 38,
                                      fit: BoxFit.contain,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Curhatin',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.textDark,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              
                              const Spacer(flex: 2),

                              // Headline and Sub-description (Animated: index 1)
                              AnimatedBuilder(
                                animation: _animations[1],
                                builder: (context, child) {
                                  return Opacity(
                                    opacity: _animations[1].value,
                                    child: Transform.translate(
                                      offset: Offset(0, 20 * (1 - _animations[1].value)),
                                      child: child,
                                    ),
                                  );
                                },
                                child: Column(
                                  children: [
                                    Text.rich(
                                      TextSpan(
                                        text: 'Kamu nggak sendirian koq,\n',
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 28,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.textDark,
                                          height: 1.3,
                                        ),
                                        children: [
                                          TextSpan(
                                            text: 'curhat di sini.',
                                            style: GoogleFonts.plusJakartaSans(
                                              color: AppColors.primary,
                                              fontWeight: FontWeight.w800,
                                              fontStyle: FontStyle.italic,
                                            ),
                                          ),
                                        ],
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Ruang aman untuk berbagi perasaan tanpa judgement. Sepenuhnya gratis dan anonim.',
                                      textAlign: TextAlign.center,
                                      style: GoogleFonts.manrope(
                                        fontSize: 15,
                                        color: AppColors.textMedium,
                                        height: 1.6,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 24),

                              // Proof / Avatar Stack Row (Animated: index 2)
                              AnimatedBuilder(
                                animation: _animations[2],
                                builder: (context, child) {
                                  return Opacity(
                                    opacity: _animations[2].value,
                                    child: Transform.translate(
                                      offset: Offset(0, 15 * (1 - _animations[2].value)),
                                      child: child,
                                    ),
                                  );
                                },
                                child: Center(
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      SizedBox(
                                        width: 72,
                                        height: 32,
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
                                                  radius: 14,
                                                  backgroundImage: NetworkImage(
                                                    'https://lh3.googleusercontent.com/aida-public/AB6AXuA_vxHYnkKt7qtoedtJNGyx278hPe7UWSzRZZZjW2o9WvtWNK_koNVyyyY4-Wgj2_20INB8V567K4zZHfMI75xKQ-u2O6QnpClbW_9Iw4SMdyclw2byC8rRSvTdhlS3fXiligRbukOtHiV2gjw44Hw4VMePa6bbJOJKP_xQ9zgzN_LK9oyCG48QRLnxuQsGfB5FHnSX1btLhhGmtVYQuPqP8Y3rdPgnzsC8f_bPl76PEtyfGXXIbK91fPq4COZhe_RH3SBXLatoH2U',
                                                  ),
                                                ),
                                              ),
                                            ),
                                            Positioned(
                                              left: 16,
                                              child: Container(
                                                decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  border: Border.all(color: Colors.white, width: 2),
                                                ),
                                                child: const CircleAvatar(
                                                  radius: 14,
                                                  backgroundImage: NetworkImage(
                                                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAAk_yrID_eHckObppOvNhoTqE9XtCAlTjXkko2VeXiClkSLUxCbjyhp6xCk5NdPyPftNm07qoLOdeEe0oVBoInwzlEGOVvACGgTNQW48dWSNkXPUnzDNdpIO2VH8JdQRnQSsJRFIiROZCFmqzd0tDQBMLOe2b9yfJwL8FTYefecMo-SseI3WTIgOnuOPCOGnnenvIY3URzJzpDTy8W4FJoNNhwfrOSqkT5qf_xQ_KjNsrWUJruCQA4AxdEvHYkJKrACqOVYHbGUVM',
                                                  ),
                                                ),
                                              ),
                                            ),
                                            Positioned(
                                              left: 32,
                                              child: Container(
                                                decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  border: Border.all(color: Colors.white, width: 2),
                                                ),
                                                child: const CircleAvatar(
                                                  radius: 14,
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
                                      Text.rich(
                                        TextSpan(
                                          text: '12,000+ ',
                                          style: GoogleFonts.manrope(
                                            color: AppColors.textDark,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13,
                                          ),
                                          children: [
                                            TextSpan(
                                              text: 'orang telah berbagi hari ini.',
                                              style: GoogleFonts.manrope(
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
                              ),

                              const Spacer(flex: 2),

                              // CTA Buttons: Masuk & Daftar (Animated: index 3)
                              AnimatedBuilder(
                                animation: _animations[3],
                                builder: (context, child) {
                                  return Opacity(
                                    opacity: _animations[3].value,
                                    child: Transform.translate(
                                      offset: Offset(0, 20 * (1 - _animations[3].value)),
                                      child: child,
                                    ),
                                  );
                                },
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    // Main CTA: Masuk
                                    Container(
                                      height: 54,
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
                                        child: Text(
                                          'Masuk ke Akun',
                                          style: GoogleFonts.manrope(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                    ),
                                    
                                    const SizedBox(height: 12),

                                    // Secondary CTA: Daftar
                                    OutlinedButton(
                                      style: OutlinedButton.styleFrom(
                                        side: const BorderSide(color: AppColors.primary, width: 1.5),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                        padding: const EdgeInsets.symmetric(vertical: 15),
                                      ),
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                        );
                                      },
                                      child: Text(
                                        'Daftar Akun Baru',
                                        style: GoogleFonts.manrope(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const Spacer(flex: 1),

                              // Shield info & Footer Links (Animated: index 4)
                              AnimatedBuilder(
                                animation: _animations[4],
                                builder: (context, child) {
                                  return Opacity(
                                    opacity: _animations[4].value,
                                    child: child,
                                  );
                                },
                                child: Column(
                                  children: [
                                    // Shield info
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.shield_outlined,
                                          color: AppColors.primary.withValues(alpha: 0.7),
                                          size: 16,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Data Terenkripsi & Anonim',
                                          style: GoogleFonts.manrope(
                                            color: AppColors.primary.withValues(alpha: 0.8),
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),

                                    const SizedBox(height: 24),

                                    // Footer Section
                                    Column(
                                      children: [
                                        Text(
                                          '© 2026 Curhatin. Kisahmu adalah prioritas kami.',
                                          textAlign: TextAlign.center,
                                          style: GoogleFonts.manrope(
                                            color: AppColors.textLight,
                                            fontSize: 11,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Wrap(
                                          alignment: WrapAlignment.center,
                                          spacing: 12,
                                          runSpacing: 4,
                                          children: [
                                            GestureDetector(
                                              onTap: () => _showLegalDialog(context, 'privacy'),
                                              child: Text(
                                                'Privacy Policy',
                                                style: GoogleFonts.manrope(
                                                  color: AppColors.primary,
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                            Text('•', style: GoogleFonts.manrope(color: AppColors.textLight, fontSize: 11)),
                                            GestureDetector(
                                              onTap: () => _showLegalDialog(context, 'terms'),
                                              child: Text(
                                                'Terms',
                                                style: GoogleFonts.manrope(
                                                  color: AppColors.primary,
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                            Text('•', style: GoogleFonts.manrope(color: AppColors.textLight, fontSize: 11)),
                                            GestureDetector(
                                              onTap: () => _showLegalDialog(context, 'safety'),
                                              child: Text(
                                                'Safety',
                                                style: GoogleFonts.manrope(
                                                  color: AppColors.primary,
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                            Text('•', style: GoogleFonts.manrope(color: AppColors.textLight, fontSize: 11)),
                                            GestureDetector(
                                              onTap: () => _showLegalDialog(context, 'contact'),
                                              child: Text(
                                                'Contact',
                                                style: GoogleFonts.manrope(
                                                  color: AppColors.primary,
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 10),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

