<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class MidtransController extends Controller
{
    public function __construct()
    {
        // Set Midtrans configuration
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
        
        // Debug: Log configuration
        Log::info('Midtrans Config Loaded', [
            'server_key' => substr(Config::$serverKey, 0, 15) . '***', // Only show first 15 chars for security
            'is_production' => Config::$isProduction,
            'is_sanitized' => Config::$isSanitized,
            'is_3ds' => Config::$is3ds,
        ]);
    }

    /**
     * Create Snap Token for payment
     */
    public function createSnapToken(Order $order)
    {
        try {
            // Generate unique order ID for Midtrans
            $midtransOrderId = 'ORD-' . $order->id . '-' . time();
            
            // Save Midtrans order ID to database for future reference
            $order->order_number = $midtransOrderId;
            $order->save();
            
            // Prepare transaction details
            $itemDetails = $order->items->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'price' => (int) $item->price,
                    'quantity' => (int) $item->quantity,
                    'name' => $item->product_name . ($item->variant_name ? ' - ' . $item->variant_name : ''),
                ];
            })->toArray();

            // Add discount as negative item if exists
            if ($order->discount_amount > 0) {
                $itemDetails[] = [
                    'id' => 'DISCOUNT',
                    'price' => -(int) $order->discount_amount,
                    'quantity' => 1,
                    'name' => 'Diskon' . ($order->discount_code ? ' (' . $order->discount_code . ')' : ''),
                ];
            }

            $params = [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int) $order->total,
                ],
                'customer_details' => [
                    'first_name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                ],
                'item_details' => $itemDetails,
            ];

            // Log transaction params for debugging
            Log::info('Creating Snap Token', [
                'order_id' => $params['transaction_details']['order_id'],
                'amount' => $params['transaction_details']['gross_amount'],
                'customer' => $params['customer_details']['email'],
            ]);

            // Get Snap Token
            $snapToken = Snap::getSnapToken($params);

            Log::info('Snap Token Created Successfully', ['order_id' => $order->id]);

            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $order->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans Snap Token Error', [
                'message' => $e->getMessage(),
                'order_id' => $order->id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Gagal membuat token pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Midtrans notification webhook
     */
    public function notification(Request $request)
    {
        try {
            $notification = new Notification();

            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status;
            $orderId = $notification->order_id;

            // Extract order ID from order_id (format: ORD-{id}-{timestamp})
            preg_match('/ORD-(\d+)-/', $orderId, $matches);
            $orderIdNumber = $matches[1] ?? null;

            if (!$orderIdNumber) {
                Log::error('Invalid order ID format: ' . $orderId);
                return response()->json(['status' => 'error', 'message' => 'Invalid order ID'], 400);
            }

            $order = Order::find($orderIdNumber);

            if (!$order) {
                Log::error('Order not found: ' . $orderIdNumber);
                return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
            }

            // Log notification for debugging
            Log::info('Midtrans Notification', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
            ]);

            // Handle different transaction status
            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'accept') {
                    // Payment success - paid = verified for Midtrans
                    $order->payment_status = 'paid';
                    $order->status = 'completed';
                    $order->paid_at = now();
                }
            } elseif ($transactionStatus == 'settlement') {
                // Payment success - paid = verified for Midtrans
                $order->payment_status = 'paid';
                $order->status = 'completed';
                $order->paid_at = now();
            } elseif ($transactionStatus == 'pending') {
                // Payment pending - tetap unpaid
                $order->payment_status = 'unpaid';
                $order->status = 'pending';
            } elseif ($transactionStatus == 'deny' || $transactionStatus == 'cancel' || $transactionStatus == 'expire') {
                // Payment failed/cancelled
                $order->payment_status = 'unpaid';
                $order->status = 'cancelled';
            }

            $order->save();

            Log::info('Order status updated', [
                'order_id' => $order->id,
                'payment_status' => $order->payment_status,
                'status' => $order->status,
            ]);

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Midtrans Notification Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Check payment status from Midtrans API and update database
     */
    public function checkStatus(Order $order)
    {
        try {
            // Only check Midtrans orders
            if ($order->payment_method !== 'midtrans') {
                return response()->json([
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                ]);
            }

            // Get transaction status from Midtrans API
            $orderId = 'ORDER-' . $order->id . '-*'; // We need to find the exact order_id with timestamp
            
            // Try to get status from Midtrans
            try {
                // Use Status API from Midtrans
                $status = \Midtrans\Transaction::status($order->order_number);
                
                $transactionStatus = $status->transaction_status;
                $fraudStatus = $status->fraud_status ?? 'accept';

                Log::info('Midtrans Status Check', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'transaction_status' => $transactionStatus,
                ]);

                // Update order status based on Midtrans response
                $oldStatus = $order->payment_status;
                
                if ($transactionStatus == 'capture') {
                    if ($fraudStatus == 'accept') {
                        $order->payment_status = 'paid'; // Paid = already verified for Midtrans
                        $order->status = 'completed';
                        $order->paid_at = now();
                    }
                } elseif ($transactionStatus == 'settlement') {
                    $order->payment_status = 'paid'; // Paid = already verified for Midtrans
                    $order->status = 'completed';
                    $order->paid_at = now();
                } elseif ($transactionStatus == 'pending') {
                    $order->payment_status = 'unpaid';
                    $order->status = 'pending';
                } elseif ($transactionStatus == 'deny' || $transactionStatus == 'cancel' || $transactionStatus == 'expire') {
                    $order->payment_status = 'unpaid';
                    $order->status = 'cancelled';
                }

                if ($oldStatus !== $order->payment_status) {
                    $order->save();
                    Log::info('Order status updated from Midtrans API', [
                        'order_id' => $order->id,
                        'old_status' => $oldStatus,
                        'new_status' => $order->payment_status,
                    ]);
                }

            } catch (\Exception $e) {
                // If error (404 = not found in Midtrans), just return current status
                Log::warning('Midtrans Status Check Failed', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'order_id' => $order->id,
                'payment_status' => $order->payment_status,
                'status' => $order->status,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Check Status Error', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Gagal memeriksa status: ' . $e->getMessage()
            ], 500);
        }
    }
}
