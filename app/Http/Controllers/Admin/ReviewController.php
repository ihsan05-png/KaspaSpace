<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user:id,name,email', 'product:id,title,slug'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%$search%"))
                  ->orWhereHas('product', fn($p) => $p->where('title', 'like', "%$search%"))
                  ->orWhere('comment', 'like', "%$search%");
            });
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('approved')) {
            $query->where('is_approved', $request->approved === '1');
        }

        $reviews = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only(['search', 'rating', 'approved']),
        ]);
    }

    public function reply(Request $request, Review $review)
    {
        $request->validate([
            'admin_reply' => 'required|string|max:1000',
        ]);

        $review->update(['admin_reply' => $request->admin_reply]);

        return back()->with('success', 'Balasan berhasil disimpan.');
    }

    public function toggleApprove(Review $review)
    {
        $review->update(['is_approved' => !$review->is_approved]);

        $status = $review->is_approved ? 'ditampilkan' : 'disembunyikan';
        return back()->with('success', "Ulasan berhasil $status.");
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return back()->with('success', 'Ulasan berhasil dihapus.');
    }
}
