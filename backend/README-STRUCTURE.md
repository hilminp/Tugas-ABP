# Routing & Controller Structure (Refactor)

This project now uses controller-based routes with middleware for authentication and authorization.

## Controllers
Controllers no longer contain manual session checks - middleware handles that:
- **SessionController**: `showLogin`, `login`, `logout`
- **RegistrationController**: `showRoleSelect`, `showPsikologForm`, `storePsikolog`, `showAnonimForm`, `storeAnonim`
- **HomeController**: `index`
- **AdminController**: `dashboard`, `viewAsUser`, `exitView`, `verifications`, `verify`, `reject`, `users`, `toggleAdmin`, `suspend`, `message`
- **FriendshipController**: `send`, `incoming`, `accept`, `reject`
- **MessageController**: `index`, `thread`, `send`
- **SearchController**: `index`

## Middleware
- **EnsureSessionAuthenticated**: Checks `session('user_id')`, redirects to login if not present
- **EnsureAdmin**: Checks `session('is_admin')`, aborts with 403 if not admin

## Route Groups
- **Auth routes** (`/home`, `/messages/*`, `/friend*`): protected by `EnsureSessionAuthenticated`
- **Admin routes** (`/admin/*`): protected by `EnsureAdmin`
- **Public routes** (`/login`, `/register`, `/search`): no auth required

## Further Improvements (Optional)
- Extract form request validation into `FormRequest` classes
- Add route model binding for cleaner parameter handling
- Move admin features to dedicated `routes/admin.php` via `RouteServiceProvider`
