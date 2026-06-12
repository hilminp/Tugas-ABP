import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../auth/models/user_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/feed_provider.dart';
import '../../../core/theme/colors.dart';
import '../../../core/network/api_client.dart';

class FeedTab extends StatefulWidget {
  final bool showCreatePostHeader;
  const FeedTab({super.key, this.showCreatePostHeader = true});

  @override
  State<FeedTab> createState() => _FeedTabState();
}

class _FeedTabState extends State<FeedTab> {
  final _postController = TextEditingController();
  File? _selectedPostImage;
  final ImagePicker _picker = ImagePicker();

  Widget _buildCreatePostHeader(BuildContext context, UserModel? user) {
    final avatarImage = user?.profileImage != null && user!.profileImage!.isNotEmpty
        ? NetworkImage(user.profileImage!.startsWith('http')
            ? user.profileImage!
            : '${ApiClient.defaultStorageUrl}/${user.profileImage}')
        : null;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.grey[200]!, width: 1),
      ),
      color: Colors.white,
      child: InkWell(
        onTap: () => _triggerCreatePost(context),
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                backgroundImage: avatarImage,
                child: avatarImage == null
                    ? const Icon(Icons.person, size: 20, color: AppColors.primary)
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Text(
                    'Apa yang sedang kamu pikirkan? Curhat di sini...',
                    style: TextStyle(color: AppColors.textMedium, fontSize: 13),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              const Icon(Icons.image_outlined, color: AppColors.primary, size: 24),
            ],
          ),
        ),
      ),
    );
  }

  void _triggerCreatePost(BuildContext context) {
    _postController.clear();
    _selectedPostImage = null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (stateContext, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            bottom: MediaQuery.of(stateContext).viewInsets.bottom + 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Bagikan Curhatan Anda', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textDark)),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMedium),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _postController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Tulis apa yang sedang mengganjal pikiranmu secara anonim...',
                  hintStyle: const TextStyle(fontSize: 13, color: AppColors.textLight),
                  filled: true,
                  fillColor: AppColors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 15),
              if (_selectedPostImage != null)
                Container(
                  height: 100,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12.0),
                        child: Icon(Icons.image, color: AppColors.primary),
                      ),
                      Expanded(
                        child: Text(
                          _selectedPostImage!.path.split(RegExp(r'[/\\]')).last,
                          style: const TextStyle(fontSize: 12, color: AppColors.textMedium),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.error),
                        onPressed: () {
                          setModalState(() {
                            _selectedPostImage = null;
                          });
                        },
                      )
                    ],
                  ),
                ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      side: const BorderSide(color: AppColors.primary),
                    ),
                    onPressed: () async {
                      try {
                        final pickedFile = await _picker.pickImage(
                          source: ImageSource.gallery,
                          imageQuality: 80,
                          maxWidth: 800,
                        );
                        if (pickedFile != null) {
                          setModalState(() {
                            _selectedPostImage = File(pickedFile.path);
                          });
                        }
                      } catch (e) {
                        debugPrint('Gagal memilih gambar: $e');
                      }
                    },
                    icon: const Icon(Icons.add_photo_alternate_outlined, color: AppColors.primary),
                    label: const Text('Tambah Gambar', style: TextStyle(color: AppColors.primary)),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                    onPressed: () async {
                      if (_postController.text.trim().isEmpty) return;
                      
                      Navigator.pop(ctx);
                      
                      final result = await Provider.of<FeedProvider>(context, listen: false).createPost(
                        _postController.text.trim(),
                        _selectedPostImage,
                      );
                      
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(result['message']),
                            backgroundColor: result['success'] ? AppColors.success : AppColors.error,
                          ),
                        );
                      }
                    },
                    child: const Text('Posting', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCommentsBottomSheet(BuildContext context, int postId) {
    final commentsController = TextEditingController();
    final feedProvider = Provider.of<FeedProvider>(context, listen: false);
    final postIndex = feedProvider.posts.indexWhere((p) => p.id == postId);
    if (postIndex == -1) return;

    final post = feedProvider.posts[postIndex];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (stateContext, setModalState) => Container(
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(stateContext).viewInsets.bottom,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 16, 16, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Komentar (${post.comments.length})', 
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textMedium),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.secondary),
              
              // Comments list
              ConstrainedBox(
                constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.45),
                child: post.comments.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 40.0),
                        child: Center(
                          child: Text('Belum ada komentar. Jadilah yang pertama!', style: TextStyle(color: AppColors.textMedium, fontSize: 14)),
                        ),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                        itemCount: post.comments.length,
                        itemBuilder: (ctx, i) {
                          final comment = post.comments[i];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 20.0),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Avatar
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: AppColors.secondary.withValues(alpha: 0.5),
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(color: AppColors.primary.withValues(alpha: 0.1), blurRadius: 8, offset: const Offset(0, 4))
                                    ]
                                  ),
                                  child: const Icon(Icons.person, size: 20, color: AppColors.primary),
                                ),
                                const SizedBox(width: 12),
                                // Content
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        comment.user.name,
                                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.textDark),
                                      ),
                                      const SizedBox(height: 4),
                                      // Bubble
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: AppColors.cardBg,
                                          borderRadius: const BorderRadius.only(
                                            topRight: Radius.circular(16),
                                            bottomLeft: Radius.circular(16),
                                            bottomRight: Radius.circular(16),
                                          ),
                                          border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
                                          boxShadow: [
                                            BoxShadow(color: AppColors.primary.withValues(alpha: 0.04), blurRadius: 20, offset: const Offset(0, 10))
                                          ]
                                        ),
                                        child: Text(
                                          comment.content,
                                          style: const TextStyle(fontSize: 14, color: AppColors.textDark, height: 1.4),
                                        ),
                                      ),

                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
              
              // Input Area
              Container(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.8),
                  border: const Border(top: BorderSide(color: AppColors.secondary, width: 0.5)),
                ),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: TextField(
                            controller: commentsController,
                            maxLines: 4,
                            minLines: 1,
                            decoration: InputDecoration(
                              hintText: 'Tulis komentar...',
                              hintStyle: const TextStyle(color: AppColors.textLight, fontSize: 14),
                              filled: true,
                              fillColor: AppColors.cardBg,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(24),
                                borderSide: BorderSide.none,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 6))
                            ]
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.send, color: Colors.white, size: 20),
                            onPressed: () async {
                              final text = commentsController.text.trim();
                              if (text.isEmpty) return;
                              commentsController.clear();
                              
                              final res = await Provider.of<FeedProvider>(context, listen: false).addComment(postId, text);
                              if (res['success']) {
                                setModalState(() {});
                              } else {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(res['message'] ?? 'Gagal menambahkan komentar.')),
                                  );
                                }
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.lock_outline, size: 12, color: AppColors.textMedium.withValues(alpha: 0.6)),
                        const SizedBox(width: 4),
                        Text(
                          'Enkripsi End-to-End & Anonim',
                          style: TextStyle(fontSize: 11, color: AppColors.textMedium.withValues(alpha: 0.6), fontWeight: FontWeight.w500),
                        ),
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final feedProvider = Provider.of<FeedProvider>(context);
    final myUser = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async => feedProvider.fetchPosts(),
        color: AppColors.primary,
        child: feedProvider.isLoading && feedProvider.posts.isEmpty
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: widget.showCreatePostHeader
                    ? (feedProvider.posts.isEmpty ? 2 : feedProvider.posts.length + 1)
                    : (feedProvider.posts.isEmpty ? 1 : feedProvider.posts.length),
                itemBuilder: (ctx, index) {
                  if (widget.showCreatePostHeader && index == 0) {
                    return _buildCreatePostHeader(context, myUser);
                  }

                  final actualIndex = widget.showCreatePostHeader ? index - 1 : index;

                  if (feedProvider.posts.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text(
                          'Belum ada postingan.',
                          style: TextStyle(color: AppColors.textMedium),
                        ),
                      ),
                    );
                  }

                  final post = feedProvider.posts[actualIndex];
                  final isOwnPost = post.user.id == myUser?.id;

                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    elevation: 1,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // User header
                          Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: AppColors.secondary.withValues(alpha: 0.5),
                                child: const Icon(Icons.person, color: AppColors.primary),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          post.user.name,
                                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textDark, fontSize: 14),
                                        ),
                                        if (post.user.isPremium) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              gradient: LinearGradient(
                                                colors: [
                                                  const Color(0xFFD4AF37).withValues(alpha: 0.2),
                                                  const Color(0xFFFFDF00).withValues(alpha: 0.2),
                                                ],
                                              ),
                                              borderRadius: BorderRadius.circular(12),
                                              border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.3)),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: const [
                                                Icon(Icons.diamond, color: Color(0xFFB8860B), size: 10),
                                                SizedBox(width: 2),
                                                Text(
                                                  'PREMIUM',
                                                  style: TextStyle(
                                                    color: Color(0xFFB8860B),
                                                    fontSize: 8,
                                                    fontWeight: FontWeight.bold,
                                                    letterSpacing: 0.5,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    Text(
                                      post.user.role.toUpperCase(),
                                      style: const TextStyle(fontSize: 10, color: AppColors.textLight, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ),
                              if (isOwnPost)
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                                  onPressed: () async {
                                    final confirm = await showGeneralDialog<bool>(
                                      context: context,
                                      barrierDismissible: true,
                                      barrierLabel: 'Dismiss',
                                      transitionDuration: const Duration(milliseconds: 300),
                                      pageBuilder: (ctx, anim1, anim2) => AlertDialog(
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                        title: Row(
                                          children: const [
                                            Icon(Icons.warning_amber_rounded, color: AppColors.error),
                                            SizedBox(width: 8),
                                            Text('Hapus Postingan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                          ],
                                        ),
                                        content: const Text(
                                          'Apakah Anda yakin ingin menghapus postingan ini?',
                                          style: TextStyle(color: AppColors.textMedium, fontSize: 13),
                                        ),
                                        actions: [
                                          TextButton(
                                            onPressed: () => Navigator.pop(ctx, false),
                                            child: const Text('Batal', style: TextStyle(color: AppColors.textMedium)),
                                          ),
                                          ElevatedButton(
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: AppColors.error,
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                            ),
                                            onPressed: () => Navigator.pop(ctx, true),
                                            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
                                          ),
                                        ],
                                      ),
                                      transitionBuilder: (ctx, anim1, anim2, child) {
                                        return ScaleTransition(
                                          scale: CurvedAnimation(
                                            parent: anim1,
                                            curve: Curves.easeOutBack,
                                          ),
                                          child: FadeTransition(
                                            opacity: anim1,
                                            child: child,
                                          ),
                                        );
                                      },
                                    );

                                    if (confirm == true) {
                                      final result = await feedProvider.deletePost(post.id);
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text(result['message'] ?? 'Postingan berhasil dihapus'),
                                            backgroundColor: result['success'] == true ? AppColors.success : AppColors.error,
                                          ),
                                        );
                                      }
                                    }
                                  },
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          
                          // Post content body
                          Text(
                            post.body,
                            style: const TextStyle(fontSize: 14, color: AppColors.textDark, height: 1.4),
                          ),
                          
                          // Post image (if exists)
                          if (post.image != null) ...[
                            const SizedBox(height: 12),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                post.image!.startsWith('http') 
                                    ? post.image! 
                                    : '${ApiClient.defaultStorageUrl}/${post.image}',
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (ctx, err, stack) => Container(
                                  height: 150,
                                  color: Colors.grey[200],
                                  alignment: Alignment.center,
                                  child: const Icon(Icons.broken_image_outlined, color: AppColors.textMedium),
                                ),
                              ),
                            ),
                          ],
                          
                          const SizedBox(height: 12),
                          const Divider(),
                          
                          // Action bar: Likes & Comments counts
                          Row(
                            children: [
                              InkWell(
                                onTap: () => feedProvider.toggleLike(post.id),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                                  child: Row(
                                    children: [
                                      Icon(
                                        post.isLiked ? Icons.favorite : Icons.favorite_border,
                                        color: post.isLiked ? AppColors.accent : AppColors.textMedium,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        '${post.likesCount}',
                                        style: const TextStyle(fontSize: 13, color: AppColors.textMedium),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 24),
                              InkWell(
                                onTap: () => _showCommentsBottomSheet(context, post.id),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.mode_comment_outlined, color: AppColors.textMedium, size: 20),
                                      const SizedBox(width: 6),
                                      Text(
                                        '${post.commentsCount}',
                                        style: const TextStyle(fontSize: 13, color: AppColors.textMedium),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
