<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyMidtransSignature
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get signature from request
        $signature = $request->input('signature_key');
        $orderId = $request->input('order_id');
        $statusCode = $request->input('status_code');
        $grossAmount = $request->input('gross_amount');
        $serverKey = config('midtrans.server_key');

        // Calculate expected signature
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        // Verify signature
        if ($signature !== $expectedSignature) {
            \Log::warning('Invalid Midtrans signature', [
                'expected' => $expectedSignature,
                'received' => $signature,
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid signature'
            ], 403);
        }

        return $next($request);
    }
}
