<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ResepsionisMiddleware
{
    /**
     * Hanya admin atau resepsionis yang bisa mengakses route terkait.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user || ! $user->hasAnyRole(['admin', 'resepsionis'])) {
            return redirect('/');
        }

        return $next($request);
    }
}
