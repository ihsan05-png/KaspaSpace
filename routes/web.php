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
use App\Http\Controllers\Admin\NewsletterController;
use App\Http\Controllers\Admin\AgreementController;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\RoomAvailabilityController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\GoogleSheetsController;

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
            ->select(['id', 'title', 'slug', 'excerpt', 'image', 'published_at', 'type'])
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
            ->select(['id', 'title', 'slug', 'excerpt', 'image', 'published_at', 'type'])
            ->limit(8)
            ->get();
            
        $latestNews = \App\Models\News::where('is_published', true)
            ->where('type', 'news')
            ->orderBy('published_at', 'desc')
            ->select(['id', 'title', 'slug', 'excerpt', 'image', 'published_at', 'type'])
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
        $products = Product::with(['category:id,name,slug', 'variants'])
            ->where('is_active', 1)
            ->select('id', 'title', 'slug', 'subtitle', 'description', 'promo_label', 'base_price', 'images', 'is_featured', 'custom_options', 'category_id', 'sort_order', 'product_type')
            ->orderBy('sort_order')
            ->get();

        // Add min_price and max_price for each product
        $products->transform(function ($product) {
            $product->min_price = $product->getMinPriceAttribute();
            $product->max_price = $product->getMaxPriceAttribute();
            return $product;
        });

        return Inertia::render('WorkSpaceSection', [
            'products' => $products,
        ]);
    })->name('workspace.section');

    // Cart routes
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
    Route::post('/cart/update-quantity', [CartController::class, 'updateQuantity'])->name('cart.updateQuantity');

    Route::get('/jasa-profesional-section', function () {
        $category = \App\Models\Category::where('slug', 'jasa-profesional')
            ->select('id', 'name', 'slug')
            ->first();
        
        $products = Product::with(['category:id,name,slug', 'variants'])
            ->when($category, function ($query) use ($category) {
                return $query->where('category_id', $category->id);
            })
            ->where('is_active', 1)
            ->select('id', 'title', 'slug', 'subtitle', 'description', 'promo_label', 'base_price', 'images', 'is_featured', 'category_id', 'sort_order', 'product_type')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('JasaProfesionalSection', [
            'products' => $products,
            'currentCategory' => $category,
        ]);
    })->name('jasa.profesional.section');

    Route::get('/food-beverage', function () {
        $category = \App\Models\Category::where('slug', 'food-beverage')
            ->select('id', 'name', 'slug')
            ->first();
        
        $products = Product::with(['category:id,name,slug', 'variants'])
            ->when($category, function ($query) use ($category) {
                return $query->where('category_id', $category->id);
            })
            ->where('is_active', 1)
            ->select('id', 'title', 'slug', 'subtitle', 'description', 'promo_label', 'base_price', 'images', 'is_featured', 'category_id', 'sort_order', 'product_type')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('FoodBeverage', [
            'products' => $products,
            'currentCategory' => $category,
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

    // Booking availability API
    Route::get('/api/booking/availability', [\App\Http\Controllers\BookingAvailabilityController::class, 'check'])->name('api.booking.availability');

    // Room availability API (room-based)
    Route::get('/api/rooms/availability', [RoomAvailabilityController::class, 'check'])->name('api.rooms.availability');

    // Room schedule API (real-time availability from database)
    Route::get('/api/room-schedule', [\App\Http\Controllers\RoomScheduleController::class, 'getSchedule'])->name('api.room.schedule');
    Route::get('/api/room-schedule/today', [\App\Http\Controllers\RoomScheduleController::class, 'getTodaySummary'])->name('api.room.today');

    // Product catalog
    Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
    Route::get('/products/{category:slug}', [\App\Http\Controllers\ProductController::class, 'category'])->name('products.category');
    Route::get('/product/{product:slug}', [\App\Http\Controllers\ProductController::class, 'show'])->name('products.show');
    Route::get('/api/products/search', [\App\Http\Controllers\ProductController::class, 'search'])->name('api.products.search');
    
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

    // API to check order status (public - for payment page polling)
    Route::get('/api/orders/{order}/status', [OrderController::class, 'checkStatus'])->name('api.orders.status.public');

    // Newsletter subscription dari footer
    Route::post('/newsletter/subscribe', function (\Illuminate\Http\Request $request) {
        $request->validate(['email' => 'required|email|max:255']);
        \App\Models\NewsletterSubscriber::subscribe(
            $request->email,
            $request->name ?? $request->email,
            'footer',
            auth()->id()
        );
        return response()->json(['message' => 'Berhasil berlangganan newsletter!']);
    })->name('newsletter.subscribe');

    // Halaman Kebijakan Privasi & Syarat dan Ketentuan
    Route::get('/privacy', function () {
        return Inertia::render('AgreementPage', [
            'agreement' => \App\Models\Agreement::getPrivacy(),
            'type'      => 'privacy',
        ]);
    })->name('privacy');

    Route::get('/terms', function () {
        return Inertia::render('AgreementPage', [
            'agreement' => \App\Models\Agreement::getTerms(),
            'type'      => 'terms',
        ]);
    })->name('terms');
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

    $isStaff = $user && (
        $user->hasAnyRole(['admin', 'resepsionis']) ||
        in_array($user->role, ['admin', 'resepsionis'])
    );

    if ($isStaff) {
        return redirect('/admin/adminlayout');
    }

    return redirect('/');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User orders page
    Route::get('/orders', [UserDashboardController::class, 'index'])->name('user.dashboard');
    Route::post('/orders/{order}/cancel', [UserDashboardController::class, 'cancelOrder'])->name('orders.cancel');
    
    // API to check order status
    Route::get('/api/orders/{order}/status', [OrderController::class, 'checkStatus'])->name('api.orders.status');

    // Reviews (user)
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'resepsionis'])->prefix('admin')->name('admin.')->group(function () {

    // ============================================================
    // SHARED: Admin + Resepsionis
    // ============================================================

    // Dashboard
    Route::get('/adminlayout', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('LandingAdmin');
    Route::get('/', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

    // Orders & Payment
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{order}/send-invoice', [AdminOrderController::class, 'sendInvoice'])->name('orders.send-invoice');
    Route::get('/orders/{order}/download-invoice', [AdminOrderController::class, 'downloadInvoice'])->name('orders.download-invoice');
    Route::get('/payments', [AdminOrderController::class, 'payments'])->name('admin.payments');
    Route::post('/orders/{order}/verify-payment', [AdminOrderController::class, 'verifyPayment'])->name('admin.orders.verify-payment');
    Route::delete('/orders/{id}/delete', [App\Http\Controllers\Admin\DashboardController::class, 'deleteOrder'])->name('orders.delete');

    // Reservations
    Route::get('reservations', function () {
        return Inertia::render('admin/Reservations', ['auth' => ['user' => Auth::user()]]);
    })->name('reservations');

    // Monitoring
    Route::get('monitoring', function () {
        return Inertia::render('admin/RoomMonitoring');
    })->name('monitoring');
    Route::patch('monitoring/stock/{product}', [\App\Http\Controllers\Admin\RoomMonitoringController::class, 'adjustStock'])->name('monitoring.adjust-stock');

    // Schedule Management
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::post('/schedule/parse-excel', [ScheduleController::class, 'parseExcel'])->name('schedule.parse-excel');
    Route::post('/schedule/upload', [ScheduleController::class, 'upload'])->name('schedule.upload');
    Route::delete('/schedule/clear', [ScheduleController::class, 'clear'])->name('schedule.clear');
    Route::get('/schedule/view', [ScheduleController::class, 'view'])->name('schedule.view');

    // Rooms (view only untuk resepsionis)
    Route::get('rooms', [RoomController::class, 'index'])->name('rooms.index');

    // Reviews (view only untuk resepsionis)
    Route::get('reviews', [AdminReviewController::class, 'index'])->name('reviews.index');

    // ============================================================
    // ADMIN ONLY
    // ============================================================
    Route::middleware('admin')->group(function () {

        // Payment Settings
        Route::get('/paymentsettings', [PaymentSettingsController::class, 'index'])->name('admin.paymentsettings');
        Route::post('/paymentsettings/qris', [PaymentSettingsController::class, 'updateQris'])->name('admin.paymentsettings.qris');
        Route::post('/paymentsettings/bank', [PaymentSettingsController::class, 'updateBank'])->name('admin.paymentsettings.bank');
        Route::post('/paymentsettings/ppn', [PaymentSettingsController::class, 'updatePpn'])->name('admin.paymentsettings.ppn');

        // Google Sheets
        Route::get('/google-sheets-config', [GoogleSheetsController::class, 'index'])->name('google-sheets');
        Route::post('/google-sheets/store', [GoogleSheetsController::class, 'store'])->name('google-sheets.store');
        Route::put('/google-sheets/update', [GoogleSheetsController::class, 'update'])->name('google-sheets.update');
        Route::post('/google-sheets/test', [GoogleSheetsController::class, 'test'])->name('google-sheets.test');
        Route::delete('/google-sheets/delete', [GoogleSheetsController::class, 'delete'])->name('google-sheets.delete');
        Route::post('/google-sheets/sync', [GoogleSheetsController::class, 'sync'])->name('google-sheets.sync');

        // Categories
        Route::resource('categories', CategoryController::class);
        Route::patch('categories/update-order', [CategoryController::class, 'updateOrder'])->name('categories.update-order');

        // Products
        Route::resource('products', ProductController::class);
        Route::post('products/{product}/duplicate', [ProductController::class, 'duplicate'])->name('products.duplicate');
        Route::patch('products/{product}/status', [ProductController::class, 'updateStatus'])->name('products.update-status');
        Route::patch('products/{product}/featured', [ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');
        Route::delete('products/bulk-delete', [ProductController::class, 'bulkDelete'])->name('products.bulk-delete');
        Route::post('products/upload-image', [ProductController::class, 'uploadImage'])->name('products.upload-image');
        Route::delete('products/delete-image', [ProductController::class, 'deleteImage'])->name('products.delete-image');
        Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
        Route::post('products/import', [ProductController::class, 'import'])->name('products.import');

        // Settings
        Route::get('settings', function () {
            return Inertia::render('admin/Settings', ['auth' => ['user' => Auth::user()]]);
        })->name('settings');

        // Statistics
        Route::get('statistics', [StatisticsController::class, 'index'])->name('statistics');

        // Discounts
        Route::resource('discounts', DiscountController::class);
        Route::patch('discounts/{discount}/toggle', [DiscountController::class, 'toggleStatus'])->name('discounts.toggle');

        // Users
        Route::resource('users', UserController::class);

        // Newsletter
        Route::post('newsletter/send', [NewsletterController::class, 'send'])->name('newsletter.send');
        Route::delete('newsletter/unsubscribe/{subscriber}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');

        // Integrations
        Route::get('integrations', function () {
            return Inertia::render('admin/Integrations', ['auth' => ['user' => Auth::user()]]);
        })->name('integrations');

        // Agreements
        Route::get('agreements', [AgreementController::class, 'index'])->name('agreements.index');
        Route::get('agreements/{agreement}/edit', [AgreementController::class, 'edit'])->name('agreements.edit');
        Route::put('agreements/{agreement}', [AgreementController::class, 'update'])->name('agreements.update');

        // News
        Route::resource('news', NewsController::class);

        // Rooms (CRUD hanya admin)
        Route::post('rooms', [RoomController::class, 'store'])->name('rooms.store');
        Route::put('rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
        Route::delete('rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');

        // Reviews (approve/delete hanya admin)
        Route::post('reviews/{review}/reply', [AdminReviewController::class, 'reply'])->name('reviews.reply');
        Route::patch('reviews/{review}/toggle-approve', [AdminReviewController::class, 'toggleApprove'])->name('reviews.toggle-approve');
        Route::delete('reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');
    });
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


Route::get('/workspace/{category?}', [WorkspaceController::class, 'index'])->name('workspace');

Route::get('/orders/{order}/payment', [CheckoutController::class, 'payment'])->name('orders.payment');
Route::post('/orders/{order}/upload-payment', [OrderController::class, 'uploadPayment'])->name('orders.upload-payment');
Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
Route::get('/orders/{order}/download-invoice', [OrderController::class, 'downloadInvoice'])->name('orders.download-invoice');


// payment adnmin routes


require __DIR__.'/auth.php';
