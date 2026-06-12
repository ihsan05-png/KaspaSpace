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
        // Kecuali untuk AJAX/API request (axios/fetch mengirim Accept: application/json)
        $isStaff = $user && (
            $user->hasAnyRole(['admin', 'resepsionis']) ||
            in_array($user->role, ['admin', 'resepsionis'])
        );

        if ($isStaff && !$request->expectsJson() && !$request->ajax()) {
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
