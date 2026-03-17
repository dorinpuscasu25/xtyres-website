<?php

use App\Http\Controllers\Api\StorefrontController;
use Illuminate\Support\Facades\Route;

Route::prefix('storefront')->group(function () {
    Route::get('bootstrap', [StorefrontController::class, 'bootstrap']);
    Route::get('home', [StorefrontController::class, 'home']);
    Route::get('catalog', [StorefrontController::class, 'catalog']);
    Route::get('products/{productKey}', [StorefrontController::class, 'product']);
    Route::get('search', [StorefrontController::class, 'search']);
    Route::get('settings', [StorefrontController::class, 'settings']);
    Route::post('orders', [StorefrontController::class, 'storeOrder']);
});
