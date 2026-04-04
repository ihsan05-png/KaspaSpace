<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::with('products:id,title,product_type')
            ->orderBy('name')
            ->get();

        $products = Product::where('is_active', true)
            ->whereIn('product_type', ['share_desk', 'private_room', 'private_office', 'meeting_room'])
            ->select('id', 'title', 'product_type')
            ->orderBy('title')
            ->get();

        return Inertia::render('admin/Rooms/Index', [
            'rooms'    => $rooms,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'               => 'required|string|max:100|unique:rooms',
            'description'        => 'nullable|string|max:500',
            'capacity'           => 'nullable|integer|min:1',
            'unit_count'         => 'required|integer|min:1',
            'unit_names'         => 'nullable|array',
            'unit_names.*'       => 'nullable|string|max:100',
            'unit_capacities'    => 'nullable|array',
            'unit_capacities.*'  => 'nullable|integer|min:0',
            // unit_product_ids: array per unit, berisi array product_id (untuk unit_count > 1)
            'unit_product_ids'   => 'nullable|array',
            'unit_product_ids.*' => 'nullable|array',
            // product_ids: untuk unit_count = 1 (room-level assignment)
            'product_ids'        => 'nullable|array',
            'product_ids.*'      => 'exists:products,id',
        ]);

        $unitNames      = collect($data['unit_names'] ?? [])->map(fn($n) => trim($n))->values()->toArray();
        $unitCapacities = collect($data['unit_capacities'] ?? [])->map(fn($c) => $c ? (int) $c : null)->values()->toArray();
        $hasCustomCaps  = collect($unitCapacities)->contains(fn($c) => $c !== null && $c > 0);

        $unitCount      = (int) $data['unit_count'];
        $unitProductIds = null;
        $productIdsToSync = $data['product_ids'] ?? [];

        if ($unitCount > 1 && !empty($data['unit_product_ids'])) {
            // Per-unit product assignment
            $unitProductIds = array_map(
                fn($ids) => array_values(array_filter(array_map('intval', $ids ?? []))),
                $data['unit_product_ids']
            );
            // Sync pivot dengan union semua product_id dari semua unit
            $productIdsToSync = array_values(array_unique(array_merge(...$unitProductIds)));
        }

        $room = Room::create([
            'name'             => $data['name'],
            'description'      => $data['description'] ?? null,
            'capacity'         => $data['capacity'] ?? 1,
            'unit_count'       => $unitCount,
            'unit_names'       => count(array_filter($unitNames)) ? $unitNames : null,
            'unit_capacities'  => $hasCustomCaps ? $unitCapacities : null,
            'unit_product_ids' => $unitProductIds,
        ]);

        if (!empty($productIdsToSync)) {
            $room->products()->sync($productIdsToSync);
        }

        if (request()->expectsJson()) {
            return response()->json(['room' => $room]);
        }

        return back()->with('success', 'Ruangan berhasil dibuat.');
    }

    public function update(Request $request, Room $room)
    {
        $data = $request->validate([
            'name'               => 'required|string|max:100|unique:rooms,name,' . $room->id,
            'description'        => 'nullable|string|max:500',
            'capacity'           => 'nullable|integer|min:1',
            'unit_count'         => 'required|integer|min:1',
            'unit_names'         => 'nullable|array',
            'unit_names.*'       => 'nullable|string|max:100',
            'unit_capacities'    => 'nullable|array',
            'unit_capacities.*'  => 'nullable|integer|min:0',
            'unit_product_ids'   => 'nullable|array',
            'unit_product_ids.*' => 'nullable|array',
            'is_active'          => 'boolean',
            'product_ids'        => 'nullable|array',
            'product_ids.*'      => 'exists:products,id',
        ]);

        $unitNames      = collect($data['unit_names'] ?? [])->map(fn($n) => trim($n))->values()->toArray();
        $unitCapacities = collect($data['unit_capacities'] ?? [])->map(fn($c) => $c ? (int) $c : null)->values()->toArray();
        $hasCustomCaps  = collect($unitCapacities)->contains(fn($c) => $c !== null && $c > 0);

        $unitCount      = (int) $data['unit_count'];
        $unitProductIds = null;
        $productIdsToSync = $data['product_ids'] ?? [];

        if ($unitCount > 1 && !empty($data['unit_product_ids'])) {
            $unitProductIds = array_map(
                fn($ids) => array_values(array_filter(array_map('intval', $ids ?? []))),
                $data['unit_product_ids']
            );
            $productIdsToSync = array_values(array_unique(array_merge(...$unitProductIds)));
        }

        $room->update([
            'name'             => $data['name'],
            'description'      => $data['description'] ?? null,
            'capacity'         => $data['capacity'] ?? 1,
            'unit_count'       => $unitCount,
            'unit_names'       => count(array_filter($unitNames)) ? $unitNames : null,
            'unit_capacities'  => $hasCustomCaps ? $unitCapacities : null,
            'unit_product_ids' => $unitProductIds,
            'is_active'        => $data['is_active'] ?? $room->is_active,
        ]);

        $room->products()->sync($productIdsToSync);

        return back()->with('success', 'Ruangan berhasil diperbarui.');
    }

    public function destroy(Room $room)
    {
        $room->products()->detach();
        $room->delete();

        if (request()->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Ruangan berhasil dihapus.');
    }
}
