<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class RoomMonitoringController extends Controller
{
    /**
     * Adjust total stock (capacity) for a room/desk product.
     * Updates ProductVariant.stock_quantity on the first active variant.
     * RoomScheduleController reads this as the total capacity; availability = total - booked.
     */
    public function adjustStock(Request $request, Product $product)
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0|max:500',
        ]);

        if (!in_array($product->product_type, ['share_desk', 'private_room', 'private_office'])) {
            return response()->json(['error' => 'Produk ini tidak dapat diatur kapasitasnya'], 422);
        }

        $variant = $product->variants()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->first();

        if (!$variant) {
            return response()->json(['error' => 'Varian produk tidak ditemukan'], 404);
        }

        $oldStock = (int) $variant->stock_quantity;
        $newStock  = (int) $request->stock_quantity;

        $variant->update(['stock_quantity' => $newStock]);

        return response()->json([
            'success'      => true,
            'product_id'   => $product->id,
            'product_name' => $product->title,
            'old_stock'    => $oldStock,
            'new_stock'    => $newStock,
        ]);
    }
}
