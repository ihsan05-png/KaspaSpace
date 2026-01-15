<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectAdminToAdminPanel
{
    /**
     * Redirect admin ke dashboard admin jika mencoba akses halaman public
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Jika user adalah admin, redirect ke dashboard admin
        if ($user && $user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
