<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- 1. AUTH & PUBLIC CONTROLLERS ---
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
// --- 2. CLIENT CONTROLLERS ---
use App\Http\Controllers\Api\Client\CategoryController;
use App\Http\Controllers\Api\Client\ProductController as ClientProductController;
use App\Http\Controllers\Api\Client\OrderController as ClientOrderController;

// --- 3. ADMIN CONTROLLERS ---
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\PublicController;

/*
|--------------------------------------------------------------------------
| 🔓 PUBLIC ROUTES (No Login Required)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/products', [ClientProductController::class, 'index']);
Route::get('/products/{id}', [ClientProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/public/settings', [PublicController::class, 'settings']);

// ⚡ TEMPORARY: One-time setup route to create admin user. DELETE AFTER USE.
Route::get('/setup-admin', function () {
    $secret = request('secret');
    if ($secret !== 'drinkshop-setup-2026') {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $user = \App\Models\User::firstOrCreate(
        ['email' => 'admin@drinkshop.com'],
        [
            'name'      => 'Admin',
            'password'  => \Illuminate\Support\Facades\Hash::make('Admin@1234'),
            'role'      => 'admin',
            'is_active' => true,
        ]
    );

    return response()->json([
        'message' => $user->wasRecentlyCreated ? '✅ Admin created!' : '⚠️ Admin already exists.',
        'email'   => 'admin@drinkshop.com',
        'password'=> 'Admin@1234',
    ]);
});
/*
|--------------------------------------------------------------------------
| 🛒 CLIENT ROUTES (Login Required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) { return $request->user(); });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/client/orders', [ClientOrderController::class, 'store']);
    Route::get('/client/orders/{id}/status', [ClientOrderController::class, 'status']);
});

// Real webhooks shouldn't require user authentication (bank sends this)
Route::post('/client/orders/{id}/webhook', [ClientOrderController::class, 'webhook']);

/*
|--------------------------------------------------------------------------
| 🛡️ ADMIN ROUTES (Login + Admin Role Required)
|--------------------------------------------------------------------------
| All routes here are prefixed with /api/admin/
*/
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {

        // --- Dashboard Stats ---
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // --- Customers Management ---
        Route::get('/customers', [DashboardController::class, 'customers']);
        Route::delete('/customers/{id}', [DashboardController::class, 'deleteCustomer']);

        // --- Product Management ---
        Route::controller(AdminProductController::class)->group(function () {
            Route::get('/products', 'index');
            Route::post('/products', 'store');
            Route::get('/products/{id}', 'show');
            Route::put('/products/{id}', 'update');
            Route::delete('/products/{id}', 'destroy');
        });

        // --- Order Management ---
        Route::get('/orders', [AdminOrderController::class, 'index']);       // Table List
        Route::put('/orders/{order}', [AdminOrderController::class, 'update']); // Update Status
        Route::get('/orders/stats', [AdminOrderController::class, 'stats']);    // Sidebar Badges

        // --- Settings ---
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::post('/settings', [AdminSettingsController::class, 'update']);
    });
