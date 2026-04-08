Admin user setup (local development)
=================================

This project provides small helpers to create a dedicated admin user for local testing.

1) Create an admin using the lightweight script

   From the `laravel` folder run:

   php database/create_admin.php [email] [username] [password]

   Example:

   php database/create_admin.php admin@example.com admin secret123

   - If the user with that email doesn't exist it will be created and flagged `is_admin = true`.
   - If it exists, the script will update `is_admin` to true and (optionally) reset username/password.

2) Alternatively, seed a default admin (local env only)

   - The `AdminUserSeeder` creates `admin@example.com` / password `password` and sets `is_admin = true`.
   - To seed just the admin:

     php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder

   - When running `DatabaseSeeder` in the local environment the admin seeder will be executed automatically.

Notes
-----
- After creating an admin change the password immediately — the provided password is for local/dev convenience only.
- Admin routes are protected by `is_admin` checks in `routes/web.php`. For local testing you can use `?as_user=<id>` to emulate a login.

Suspending users and notifying them
----------------------------------

- Administrators can now suspend/un-suspend users and optionally provide a suspension reason via the admin UI.
   - From the admin page: GET /admin/users (must be admin). For local testing you can use ?as_user=<id> to simulate the admin.
   - The admin panel includes a suspend form where you must include a reason (visible to the user).

- Administrators can also send a message directly to any user (no friendship required) from the admin page. Use the "Send" input next to each user to notify them why they were suspended.

Developer helpers
-----------------
- CLI helper to suspend a user directly (for local testing):

   php database/suspend_user.php <user_id> "<reason>"

- CLI helper to send an admin message:

   php database/send_admin_message.php <admin_id> <recipient_id> "message body"

