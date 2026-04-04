<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Search products by keyword
     */
    public function search(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $products = Product::with(['category:id,name,slug', 'variants:id,product_id,price,is_active'])
            ->where('is_active', true)
            ->whereRaw('MATCH(title, subtitle) AGAINST(? IN BOOLEAN MODE)', [$query . '*'])
            ->select('id', 'title', 'slug', 'base_price', 'images', 'category_id')
            ->orderBy('sort_order')
            ->limit(6)
            ->get()
            ->map(function ($product) {
                $images = $this->parseImages($product->images);
                $minVariantPrice = $product->variants->where('is_active', true)->min('price');
                $displayPrice = $minVariantPrice ?? (float) $product->base_price;
                $imageUrl = isset($images[0]) ? '/storage/' . $images[0] : null;
                return [
                    'id'         => $product->id,
                    'title'      => $product->title,
                    'slug'       => $product->slug,
                    'min_price'  => (float) $displayPrice,
                    'image'      => $imageUrl,
                    'category'   => $product->category ? $product->category->name : null,
                ];
            });

        return response()->json($products);
    }

    /**
     * Display a listing of products
     */
    public function index()
    {
        $products = Product::with(['category', 'variants'])
            ->active()
            ->ordered()
            ->get()
            ->map(function ($product) {
                return $this->formatProductForInertia($product);
            });
        
        // Debug: Log first product
        if ($products->isNotEmpty()) {
            \Log::info('First product from index:', $products->first());
        }
        
        return Inertia::render('Products/Index', [
            'products' => $products->values()->all(), // PENTING: Convert ke plain array
        ]);
    }

    /**
     * Display the specified product
     */
    public function show($slug)
    {
        $product = Product::with(['category', 'variants', 'recommendedProducts.category', 'recommendedProducts.variants', 'rooms'])
            ->where('slug', $slug)
            ->firstOrFail();

        $formattedProduct = $this->formatProductForInertia($product);

        // Load approved reviews with user info
        $reviews = $product->approvedReviews()
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(fn($r) => [
                'id'          => $r->id,
                'rating'      => $r->rating,
                'comment'     => $r->comment,
                'admin_reply' => $r->admin_reply,
                'created_at'  => $r->created_at->format('d M Y'),
                'user'        => ['name' => $r->user->name ?? 'Pengguna'],
                'is_mine'     => Auth::check() && Auth::id() === $r->user_id,
            ]);

        $avgRating = $reviews->avg('rating');
        $reviewCount = $reviews->count();

        // Apakah user login sudah pernah review produk ini
        $userHasReviewed = false;
        $canReview = false;
        if (Auth::check()) {
            $user = Auth::user();
            $userHasReviewed = $product->reviews()->where('user_id', $user->id)->exists();
            if (!$userHasReviewed) {
                $canReview = OrderItem::where('product_id', $product->id)
                    ->whereHas('order', fn($q) => $q->where('customer_email', $user->email)->where('payment_status', 'paid'))
                    ->exists();
            }
        }

        // Rooms yang tersedia untuk produk ini
        $rooms = $product->rooms->where('is_active', true)->map(fn($r) => [
            'id'       => $r->id,
            'name'     => $r->name,
            'capacity' => $r->capacity,
        ])->values()->all();

        // Produk terkait: produk lain dalam kategori yang sama (maks 4)
        $relatedProducts = Product::with(['variants'])
            ->withCount(['approvedReviews as review_count'])
            ->withAvg(['approvedReviews as avg_rating'], 'rating')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->limit(4)
            ->get()
            ->map(fn($p) => [
                'id'          => $p->id,
                'title'       => $p->title,
                'slug'        => $p->slug,
                'images'      => $this->parseImages($p->images),
                'base_price'  => $p->base_price,
                'avg_rating'  => $p->avg_rating ? round((float) $p->avg_rating, 1) : null,
                'review_count'=> (int) $p->review_count,
                'variants'    => $p->variants->where('is_active', true)
                                    ->sortBy('sort_order')
                                    ->map(fn($v) => ['price' => (float) $v->price])
                                    ->values()->all(),
            ])->all();

        return Inertia::render('Products/Show', [
            'product'         => $formattedProduct,
            'rooms'           => $rooms,
            'relatedProducts' => $relatedProducts,
            'reviews'         => $reviews,
            'avgRating'       => $avgRating ? round($avgRating, 1) : null,
            'reviewCount'     => $reviewCount,
            'canReview'       => $canReview,
            'userHasReviewed' => $userHasReviewed,
        ]);
    }
    
    /**
     * Format product untuk Inertia.js
     */
    private function formatProductForInertia($product)
    {
        // Pastikan variants ter-load
        if (!$product->relationLoaded('variants')) {
            $product->load('variants');
        }
        
        $data = [
            'id' => $product->id,
            'title' => $product->title ?? '',
            'subtitle' => $product->subtitle ?? '',
            'slug' => $product->slug ?? '',
            'description' => $product->description ?? '',
            'base_price' => $product->base_price ?? 0,
            'promo_label' => $product->promo_label ?? null,
            'images' => $this->parseImages($product->images),
            'is_active' => $product->is_active ?? true,
            'product_type' => $product->product_type ?? null,
            'open_time' => $product->open_time ?? null,
            'close_time' => $product->close_time ?? null,
            'category' => null,
            'variants' => [],
            'custom_options' => [],
            'recommendedProducts' => [],
        ];
        
        // Format category
        if ($product->relationLoaded('category') && $product->category) {
            $data['category'] = [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug ?? '',
            ];
        }
        
        // Format variants
        if ($product->relationLoaded('variants') && $product->variants) {
            $data['variants'] = $product->variants->map(function ($variant) {
                return [
                    'id' => $variant->id,
                    'name' => $variant->name ?? '',
                    'description' => $variant->description ?? null,
                    'sku' => $variant->sku ?? null,
                    'price' => (float) ($variant->price ?? 0),
                    'compare_price' => $variant->compare_price ? (float) $variant->compare_price : null,
                    'is_active' => (bool) ($variant->is_active ?? true),
                    'manage_stock' => (bool) ($variant->manage_stock ?? false),
                    'stock_quantity' => (int) ($variant->stock_quantity ?? 0),
                    'sort_order' => (int) ($variant->sort_order ?? 0),
                    'attributes' => $variant->attributes ?? null,
                    'image' => $variant->image ?? null,
                    'duration_hours' => $variant->duration_hours ? (float) $variant->duration_hours : null,
                ];
            })->toArray();
        }
        
        // Parse custom options
        $data['custom_options'] = $this->parseCustomOptions($product->custom_options);
        
        // Format recommended products
        if ($product->relationLoaded('recommendedProducts') && $product->recommendedProducts) {
            $data['recommendedProducts'] = $product->recommendedProducts->map(function ($p) {
                return $this->formatProductForInertia($p);
            })->toArray();
        }
        
        return $data;
    }
    
    /**
     * Parse images dari JSON/array
     */
    private function parseImages($images)
    {
        if (empty($images)) {
            return [];
        }
        
        // Jika sudah array, return langsung
        if (is_array($images)) {
            return $images;
        }
        
        // Jika string JSON, decode
        if (is_string($images)) {
            $decoded = json_decode($images, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return [];
    }
    
    /**
     * Parse custom options dari JSON/array
     */
    private function parseCustomOptions($customOptions)
    {
        if (empty($customOptions)) {
            return [];
        }
        
        // Jika sudah array, return langsung
        if (is_array($customOptions)) {
            // PENTING: Map ulang untuk memastikan struktur konsisten
            return array_map(function($option) {
                return [
                    'name' => $option['question'] ?? $option['name'] ?? '',
                    'label' => $option['question'] ?? $option['label'] ?? $option['name'] ?? '',
                    'type' => $option['type'] ?? 'text',
                    'required' => $option['required'] ?? false,
                    'placeholder' => $option['placeholder'] ?? null,
                    'options' => $option['options'] ?? null,
                ];
            }, $customOptions);
        }
        
        // Jika string JSON, decode
        if (is_string($customOptions)) {
            $decoded = json_decode($customOptions, true);
            if (is_array($decoded)) {
                return array_map(function($option) {
                    return [
                        'name' => $option['question'] ?? $option['name'] ?? '',
                        'label' => $option['question'] ?? $option['label'] ?? $option['name'] ?? '',
                        'type' => $option['type'] ?? 'text',
                        'required' => $option['required'] ?? false,
                        'placeholder' => $option['placeholder'] ?? null,
                        'options' => $option['options'] ?? null,
                    ];
                }, $decoded);
            }
        }
        
        return [];
    }
}