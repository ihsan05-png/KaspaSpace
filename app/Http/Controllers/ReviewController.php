<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Simpan review baru.
     * Hanya bisa kalau user punya order dengan status 'completed' yang mengandung product ini.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        // Cek apakah user sudah pernah review produk ini
        $existing = Review::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            return back()->with('error', 'Anda sudah memberikan ulasan untuk produk ini.');
        }

        // Cari order completed yang mengandung produk ini
        $orderItem = OrderItem::where('product_id', $request->product_id)
            ->whereHas('order', function ($q) use ($user) {
                $q->where('customer_email', $user->email)
                  ->where('payment_status', 'paid');
            })
            ->with('order')
            ->first();

        if (!$orderItem) {
            return back()->with('error', 'Anda hanya bisa memberikan ulasan untuk produk yang sudah Anda beli dan selesai.');
        }

        Review::create([
            'user_id'    => $user->id,
            'product_id' => $request->product_id,
            'order_id'   => $orderItem->order_id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
            'is_approved' => true,
        ]);

        return back()->with('success', 'Ulasan berhasil dikirim. Terima kasih!');
    }

    /**
     * Hapus review milik user sendiri.
     */
    public function destroy(Review $review)
    {
        if ($review->user_id !== Auth::id()) {
            abort(403);
        }

        $review->delete();

        return back()->with('success', 'Ulasan berhasil dihapus.');
    }
}
