<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class DiscountController extends Controller
{
    /**
     * Display a listing of discounts
     */
    public function index()
    {
        $discounts = Discount::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('admin/Discounts/Index', [
            'discounts' => $discounts
        ]);
    }

    /**
     * Show the form for creating a new discount
     */
    public function create()
    {
        $products = Product::select('id', 'title', 'base_price')
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        $users = User::select('id', 'name', 'email')
            ->where('role', 'user')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/Discounts/Create', [
            'products' => $products,
            'users' => $users
        ]);
    }

    /**
     * Store a newly created discount
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:discounts,code|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        // Validasi khusus untuk percentage type
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'Persentase tidak boleh lebih dari 100%']);
        }

        $discount = Discount::create($validated);

        // Attach products jika ada yang dipilih
        if (!empty($validated['product_ids'])) {
            $discount->products()->attach($validated['product_ids']);
        }

        // Attach users jika ada yang dipilih
        if (!empty($validated['user_ids'])) {
            $discount->users()->attach($validated['user_ids']);
        }

        return redirect()->route('admin.discounts.index')
            ->with('success', 'Diskon berhasil dibuat');
    }

    /**
     * Show the form for editing discount
     */
    public function edit(Discount $discount)
    {
        $products = Product::select('id', 'title', 'base_price')
            ->where('is_active', true)
            ->orderBy('title')
            ->get();

        $users = User::select('id', 'name', 'email')
            ->where('role', 'user')
            ->orderBy('name')
            ->get();

        $discount->load('products', 'users');

        return Inertia::render('admin/Discounts/Edit', [
            'discount' => $discount,
            'products' => $products,
            'users' => $users
        ]);
    }

    /**
     * Update the specified discount
     */
    public function update(Request $request, Discount $discount)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:discounts,code,' . $discount->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        // Validasi khusus untuk percentage type
        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'Persentase tidak boleh lebih dari 100%']);
        }

        $discount->update($validated);

        // Sync products
        if (isset($validated['product_ids'])) {
            $discount->products()->sync($validated['product_ids']);
        } else {
            $discount->products()->detach();
        }

        // Sync users
        if (isset($validated['user_ids'])) {
            $discount->users()->sync($validated['user_ids']);
        } else {
            $discount->users()->detach();
        }

        return redirect()->route('admin.discounts.index')
            ->with('success', 'Diskon berhasil diupdate');
    }

    /**
     * Remove the specified discount
     */
    public function destroy(Discount $discount)
    {
        $discount->delete();

        return redirect()->route('admin.discounts.index')
            ->with('success', 'Diskon berhasil dihapus');
    }

    /**
     * Toggle discount status
     */
    public function toggleStatus(Discount $discount)
    {
        $discount->update([
            'is_active' => !$discount->is_active
        ]);

        return back()->with('success', 'Status diskon berhasil diubah');
    }

    /**
     * Validate discount code (API for frontend)
     */
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'integer'
        ]);

        $discount = Discount::where('code', $request->code)->first();

        if (!$discount) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode diskon tidak ditemukan'
            ], 404);
        }

        // Load produk yang dipilih untuk diskon
        $discount->load('products');

        // Check apakah diskon berlaku untuk produk di cart
        if ($request->has('product_ids') && !empty($request->product_ids)) {
            $cartProductIds = $request->product_ids;
            
            // Jika diskon memiliki produk yang dipilih (tidak berlaku untuk semua)
            if ($discount->products->count() > 0) {
                $discountProductIds = $discount->products->pluck('id')->toArray();
                
                // Check apakah ada produk di cart yang bisa dapat diskon
                $hasApplicableProduct = false;
                foreach ($cartProductIds as $productId) {
                    if (in_array($productId, $discountProductIds)) {
                        $hasApplicableProduct = true;
                        break;
                    }
                }

                if (!$hasApplicableProduct) {
                    return response()->json([
                        'valid' => false,
                        'message' => 'Diskon ini tidak berlaku untuk produk di keranjang Anda'
                    ], 400);
                }
            }
        }

        if (!$discount->isValid($request->subtotal)) {
            $message = 'Kode diskon tidak valid';
            
            if (!$discount->is_active) {
                $message = 'Kode diskon tidak aktif';
            } elseif ($discount->isExpired()) {
                $message = 'Kode diskon sudah kadaluarsa';
            } elseif ($discount->isUsageLimitReached()) {
                $message = 'Kode diskon sudah mencapai batas penggunaan';
            } elseif ($discount->min_purchase && $request->subtotal < $discount->min_purchase) {
                $message = 'Minimum pembelian Rp ' . number_format($discount->min_purchase, 0, ',', '.');
            }
            
            return response()->json([
                'valid' => false,
                'message' => $message
            ], 400);
        }

        $discountAmount = $discount->calculateDiscount($request->subtotal);

        return response()->json([
            'valid' => true,
            'discount' => [
                'id' => $discount->id,
                'code' => $discount->code,
                'name' => $discount->name,
                'type' => $discount->type,
                'value' => $discount->value,
                'amount' => $discountAmount,
                'formatted_amount' => 'Rp ' . number_format($discountAmount, 0, ',', '.')
            ],
            'message' => 'Kode diskon berhasil diterapkan'
        ]);
    }
}
