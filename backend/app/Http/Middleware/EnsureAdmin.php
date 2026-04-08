<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!session('user_id')) {
            return redirect('/login');
        }
        if (!session('is_admin')) {
            abort(403);
        }
        return $next($request);
    }
}
