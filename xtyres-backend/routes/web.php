<?php

use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\AttributeOptionController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\StoreSettingsController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::redirect('dashboard', '/admin')->name('dashboard');

    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('brands', [BrandController::class, 'index'])->name('brands.index');
        Route::get('brands/create', [BrandController::class, 'create'])->name('brands.create');
        Route::post('brands', [BrandController::class, 'store'])->name('brands.store');
        Route::get('brands/{brand}/edit', [BrandController::class, 'edit'])->name('brands.edit');
        Route::put('brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
        Route::delete('brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('attributes', [AttributeController::class, 'index'])->name('attributes.index');
        Route::get('attributes/create', [AttributeController::class, 'create'])->name('attributes.create');
        Route::post('attributes', [AttributeController::class, 'store'])->name('attributes.store');
        Route::get('attributes/{attribute}/edit', [AttributeController::class, 'edit'])->name('attributes.edit');
        Route::put('attributes/{attribute}', [AttributeController::class, 'update'])->name('attributes.update');
        Route::delete('attributes/{attribute}', [AttributeController::class, 'destroy'])->name('attributes.destroy');
        Route::get('attributes/{attribute}/options', [AttributeOptionController::class, 'index'])->name('attributes.options.index');
        Route::get('attributes/{attribute}/options/create', [AttributeOptionController::class, 'create'])->name('attributes.options.create');
        Route::post('attributes/{attribute}/options', [AttributeOptionController::class, 'store'])->name('attributes.options.store');
        Route::get('attributes/{attribute}/options/{option}/edit', [AttributeOptionController::class, 'edit'])->name('attributes.options.edit');
        Route::put('attributes/{attribute}/options/{option}', [AttributeOptionController::class, 'update'])->name('attributes.options.update');
        Route::delete('attributes/{attribute}/options/{option}', [AttributeOptionController::class, 'destroy'])->name('attributes.options.destroy');

        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::put('orders/{order}', [OrderController::class, 'update'])->name('orders.update');

        Route::get('settings', [StoreSettingsController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [StoreSettingsController::class, 'update'])->name('settings.update');
    });
});

require __DIR__.'/settings.php';
