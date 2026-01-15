<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\WorkspaceController;

use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\PaymentSettingsController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserDashboardController;

use App\Models\GoogleSheetsConfig;
use App\Models\Product;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['redirect.admin'])->group(function () {
    Route::get('/', function () {
        $latestMedia = \App\Models\News::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->limit(4)
            ->get();
            
        return Inertia::render('LandingPage', [
            'latestMedia' => $latestMedia,
        ]);
    });

    Route::get('/media', function () {
        $latestBlogs = \App\Models\News::where('is_published', true)
            ->where('type', 'blogs')
            ->orderBy('published_at', 'desc')
            ->limit(8)
            ->get();
            
        $latestNews = \App\Models\News::where('is_published', true)
            ->where('type', 'news')
            ->orderBy('published_at', 'desc')
            ->limit(8)
            ->get();
            
        return Inertia::render('Media', [
            'latestBlogs' => $latestBlogs,
            'latestNews' => $latestNews,
        ]);
    })->name('media');

    Route::get('/contact', function () {
        return Inertia::render('Contact');
    })->name('contact');

    // Public News Routes
    Route::get('/news', [NewsController::class, 'publicIndex'])->name('news.index');
    Route::get('/news/{slug}', [NewsController::class, 'publicShow'])->name('news.show');
    
    // Public Blogs Routes
    Route::get('/blogs', [NewsController::class, 'publicBlogs'])->name('blogs.index');
    Route::get('/blogs/{slug}', [NewsController::class, 'publicShow'])->name('blogs.show');

    Route::get('/ai-app', function () {
        return Inertia::render('AiApp');
    })->name('ai.app');

    Route::get('/workspace-section', function () {
    $products = Product::with(['category', 'variants']) // PENTING: Load variants
        ->where('is_active', 1)
        ->orderBy('sort_order')
        ->get()
        ->map(function ($product) {
            return [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'subtitle' => $product->subtitle,
                'description' => $product->description,
                'promo_label' => $product->promo_label,
                'base_price' => (string) $product->base_price,
                'images' => is_array($product->images) ? $product->images : [],
                'is_featured' => $product->is_featured,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                // TAMBAHKAN INI - Variants
                'variants' => $product->variants->map(function ($variant) {
                    return [
                        'id' => $variant->id,
                        'name' => $variant->name,
                        'description' => $variant->description ?? null,
                        'sku' => $variant->sku,
                        'price' => (float) $variant->price,
                        'compare_price' => $variant->compare_price ? (float) $variant->compare_price : null,
                        'is_active' => (bool) $variant->is_active,
                        'manage_stock' => (bool) $variant->manage_stock,
                        'stock_quantity' => (int) $variant->stock_quantity,
                        'sort_order' => (int) $variant->sort_order,
                        'attributes' => $variant->attributes,
                        'image' => $variant->image,
                    ];
                })->toArray(),
                // TAMBAHKAN INI - Custom Options
                'custom_options' => is_array($product->custom_options) 
                    ? array_map(function($option) {
                        return [
                            'name' => $option['question'] ?? $option['name'] ?? '',
                            'label' => $option['question'] ?? $option['label'] ?? $option['name'] ?? '',
                            'type' => $option['type'] ?? 'text',
                            'required' => $option['required'] ?? false,
                            'placeholder' => $option['placeholder'] ?? null,
                            'options' => $option['options'] ?? null,
                        ];
                    }, $product->custom_options)
                    : [],
            ];
        })->values()->toArray();
    
    return Inertia::render('WorkSpaceSection', [
        'products' => $products
    ]);
    })->name('workspace.section');

    // Cart routes
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
    Route::post('/cart/update-quantity', [CartController::class, 'updateQuantity'])->name('cart.updateQuantity');

    Route::get('/jasa-profesional-section', function () {
        $category = \App\Models\Category::where('slug', 'jasa-profesional')->first();
        
        $products = Product::with(['category', 'variants'])
            ->when($category, function ($query) use ($category) {
                return $query->where('category_id', $category->id);
            })
            ->where('is_active', 1)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'title' => $product->title,
                    'slug' => $product->slug,
                    'subtitle' => $product->subtitle,
                    'description' => $product->description,
                    'promo_label' => $product->promo_label,
                    'base_price' => (string) $product->base_price,
                    'images' => is_array($product->images) ? $product->images : [],
                    'is_featured' => $product->is_featured,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                        'slug' => $product->category->slug,
                    ] : null,
                    'variants' => $product->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'name' => $variant->name,
                            'description' => $variant->description ?? null,
                            'sku' => $variant->sku,
                            'price' => (float) $variant->price,
                            'compare_price' => $variant->compare_price ? (float) $variant->compare_price : null,
                            'is_active' => (bool) $variant->is_active,
                            'manage_stock' => (bool) $variant->manage_stock,
                            'stock_quantity' => (int) $variant->stock_quantity,
                            'sort_order' => (int) $variant->sort_order,
                            'attributes' => $variant->attributes,
                            'image' => $variant->image,
                        ];
                    })->toArray(),
                ];
            });

        return Inertia::render('JasaProfesionalSection', [
            'products' => $products,
            'currentCategory' => $category ? [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ] : null,
        ]);
    })->name('jasa.profesional.section');

    Route::get('/food-beverage', function () {
        $category = \App\Models\Category::where('slug', 'food-beverage')->first();
        
        $products = Product::with(['category', 'variants'])
            ->when($category, function ($query) use ($category) {
                return $query->where('category_id', $category->id);
            })
            ->where('is_active', 1)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'title' => $product->title,
                    'slug' => $product->slug,
                    'subtitle' => $product->subtitle,
                    'description' => $product->description,
                    'promo_label' => $product->promo_label,
                    'base_price' => (string) $product->base_price,
                    'images' => is_array($product->images) ? $product->images : [],
                    'is_featured' => $product->is_featured,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                        'slug' => $product->category->slug,
                    ] : null,
                    'variants' => $product->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'name' => $variant->name,
                            'description' => $variant->description ?? null,
                            'sku' => $variant->sku,
                            'price' => (float) $variant->price,
                            'compare_price' => $variant->compare_price ? (float) $variant->compare_price : null,
                            'is_active' => (bool) $variant->is_active,
                            'manage_stock' => (bool) $variant->manage_stock,
                            'stock_quantity' => (int) $variant->stock_quantity,
                            'sort_order' => (int) $variant->sort_order,
                            'attributes' => $variant->attributes,
                            'image' => $variant->image,
                        ];
                    })->toArray(),
                ];
            });

        return Inertia::render('FoodBeverage', [
            'products' => $products,
            'currentCategory' => $category ? [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ] : null,
        ]);
    })->name('food.beverage');

    // Public Schedule Routes
    Route::get('/jadwal-ruangan', function() {
        return Inertia::render('Schedule/Index', [
            'initialData' => \App\Models\Schedule::all(),
            'googleSheetsConfig' => GoogleSheetsConfig::where('is_active', true)->first(),
        ]);
    })->name('schedule.index');

    // API untuk real-time data
    Route::get('/api/schedule-data', [ScheduleController::class, 'getPublicData']);
    
    // Product catalog
    Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
    Route::get('/products/{category:slug}', [\App\Http\Controllers\ProductController::class, 'category'])->name('products.category');
    Route::get('/product/{product:slug}', [\App\Http\Controllers\ProductController::class, 'show'])->name('products.show');
    
    // Checkout
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/checkout/success/{order}', [CheckoutController::class, 'success'])->name('checkout.success');
    
    // Discount Validation
    Route::post('/validate-discount', [DiscountController::class, 'validate'])->name('discount.validate');
    
    // Order Payment
    Route::get('/order/{order}/payment', [CheckoutController::class, 'payment'])->name('order.payment');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('order.cancel');
    
    // Midtrans
    Route::post('/midtrans/create-snap-token/{order}', [MidtransController::class, 'createSnapToken'])->name('midtrans.create-snap-token');
    Route::get('/midtrans/check-status/{order}', [MidtransController::class, 'checkStatus'])->name('midtrans.check-status');
});

// Midtrans Webhook (tidak pakai middleware karena dari external)
Route::post('/midtrans/notification', [MidtransController::class, 'notification'])->name('midtrans.notification');

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function () {
    $user = Auth::user();

    if ($user && $user->role === 'admin') {
        return redirect('/admin/adminlayout');
    }

    return redirect('/');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // User Dashboard
    Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('user.dashboard');
    Route::post('/orders/{order}/cancel', [UserDashboardController::class, 'cancelOrder'])->name('orders.cancel');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::get('/admin/test', function () {
    return response()->json(['message' => 'Admin route works']);
})->name('admin.test');

// Test route untuk melihat admin users
Route::get('/test-admin-users', function () {
    $users = \App\Models\User::all(['name', 'email', 'created_at']);
    return response()->json([
        'total_users' => $users->count(),
        'users' => $users
    ]);
});

// Route untuk logout dari admin (khusus untuk testing)
Route::get('/admin-logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/login')->with('message', 'Berhasil logout dari admin');
})->name('admin.logout');

// Route untuk cek status login
Route::get('/check-auth', function () {
    return response()->json([
        'authenticated' => Auth::check(),
        'user' => Auth::user() ? Auth::user()->only(['name', 'email']) : null
    ]);
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Dashboard
    Route::get('/adminlayout', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('LandingAdmin');
    
    // Alias untuk dashboard admin
    Route::get('/', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

    // Delete order dari dashboard
    Route::delete('/orders/{id}/delete', [App\Http\Controllers\Admin\DashboardController::class, 'deleteOrder'])->name('orders.delete');

    // Payment Settings routes (bukan bagian dari orders, tapi pengaturan sistem)
    Route::get('/paymentsettings', [PaymentSettingsController::class, 'index'])->name('admin.paymentsettings');
    Route::post('/paymentsettings/qris', [PaymentSettingsController::class, 'updateQris'])->name('admin.paymentsettings.qris');
    Route::post('/paymentsettings/bank', [PaymentSettingsController::class, 'updateBank'])->name('admin.paymentsettings.bank');
    
    // Payment Verification routes
    Route::get('/payments', [AdminOrderController::class, 'payments'])->name('admin.payments');
    Route::post('/orders/{order}/verify-payment', [AdminOrderController::class, 'verifyPayment'])->name('admin.orders.verify-payment');

    // Schedule Management Routes
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::post('/schedule/upload', [ScheduleController::class, 'upload'])->name('schedule.upload');
    Route::delete('/schedule/clear', [ScheduleController::class, 'clear'])->name('schedule.clear');
    Route::get('/schedule/view', [ScheduleController::class, 'view'])->name('schedule.view');

    // Google Sheets Configuration
    Route::get('/google-sheets-config', function() {
        return Inertia::render('Admin/GoogleSheetsConfig', [
            'currentConfig' => GoogleSheetsConfig::first(),
        ]);
    })->name('google-sheets');
    
    Route::get('/test-orders', function () {
        $orders = \App\Models\Order::with('items.product', 'items.productVariant')
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'total' => (float) $order->total,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            })
            ->toArray();
        
        return response()->json([
            'count' => count($orders),
            'orders' => $orders
        ]);
    });

    
    // routes untuk Category ya gess
    Route::resource('categories', CategoryController::class);
    Route::patch('categories/update-order', [CategoryController::class, 'updateOrder'])->name('categories.update-order');

    // routes untuk Product ya gess
    Route::resource('products', ProductController::class);
    Route::post('products/{product}/duplicate', [ProductController::class, 'duplicate'])->name('products.duplicate');
    Route::patch('products/{product}/status', [ProductController::class, 'updateStatus'])->name('products.update-status');
    Route::patch('products/{product}/featured', [ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');
    Route::delete('products/bulk-delete', [ProductController::class, 'bulkDelete'])->name('products.bulk-delete');
    
    
    Route::post('products/upload-image', [ProductController::class, 'uploadImage'])->name('products.upload-image');
    Route::delete('products/delete-image', [ProductController::class, 'deleteImage'])->name('products.delete-image');
    
    // routes untuk Export/Import produk ya gess
    Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
    Route::post('products/import', [ProductController::class, 'import'])->name('products.import');

    // routes untuk page admin ya gess
    Route::get('settings', function () {
        return Inertia::render('admin/Settings', [
            'auth' => ['user' => Auth::user()]
        ]);
    })->name('settings');

    Route::get('statistics', function () {
        return Inertia::render('admin/Statistics', [
            'auth' => ['user' => Auth::user()]
        ]);
    })->name('statistics');

    Route::get('reservations', function () {
        return Inertia::render('admin/Reservations', [
            'auth' => ['user' => Auth::user()]
        ]);
    })->name('reservations');

    // Discounts Management Routes
    Route::resource('discounts', DiscountController::class);
    Route::patch('discounts/{discount}/toggle', [DiscountController::class, 'toggleStatus'])->name('discounts.toggle');

    // Users Management Routes
    Route::resource('users', UserController::class);

    Route::get('integrations', function () {
        return Inertia::render('admin/Integrations', [
            'auth' => ['user' => Auth::user()]
        ]);
    })->name('integrations');
    
    // Admin Orders Management Routes
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
    
    // News Management Routes
    Route::resource('news', NewsController::class);
});

/*
|--------------------------------------------------------------------------
| Schedule Management Route (Legacy)
|--------------------------------------------------------------------------
*/

Route::get('/ScheduleManagement', function () {
    return Inertia::render('Admin/ScheduleManagement');
})->name('schedule.management');

/*
|--------------------------------------------------------------------------
| Login Page Route
|--------------------------------------------------------------------------
*/

Route::get('/adminlogin', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('admin.login.page');


// checkout

// Cart routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/update-quantity', [CartController::class, 'updateQuantity'])->name('cart.updateQuantity');

// Checkout routes
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/order/success/{order}', [CheckoutController::class, 'success'])->name('order.success');



Route::get('/test-product/{slug}', function ($slug) {
    $product = \App\Models\Product::with(['variants'])
        ->where('slug', $slug)
        ->firstOrFail();
    
    return response()->json([
        'id' => $product->id,
        'title' => $product->title,
        'variants_loaded' => $product->relationLoaded('variants'),
        'variants_count' => $product->variants->count(),
        'variants' => $product->variants->toArray(),
        'custom_options_type' => gettype($product->custom_options),
        'custom_options' => $product->custom_options,
        'images_type' => gettype($product->images),
        'images' => $product->images,
    ]);
});

Route::get('/workspace/{category?}', [WorkspaceController::class, 'index'])->name('workspace');

// cutomer routes
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/orders/{order}/payment', [CheckoutController::class, 'payment'])->name('orders.payment');
Route::post('/orders/{order}/upload-payment', [OrderController::class, 'uploadPayment'])->name('orders.upload-payment');
Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');


// payment adnmin routes


require __DIR__.'/auth.php';
