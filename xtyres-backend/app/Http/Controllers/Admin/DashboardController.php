<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $recentProducts = Product::query()
            ->with(['brand', 'primaryCategory'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $this->localize($product->getTranslations('name')),
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'brand' => $product->brand ? $this->localize($product->brand->getTranslations('name')) : null,
                'category' => $product->primaryCategory ? $this->localize($product->primaryCategory->getTranslations('name')) : null,
                'is_active' => $product->is_active,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'products' => Product::count(),
                'categories' => Category::count(),
                'brands' => Brand::count(),
                'attributes' => Attribute::count(),
                'orders' => Order::count(),
                'featuredProducts' => Product::where('is_featured', true)->count(),
            ],
            'recentProducts' => $recentProducts,
        ]);
    }
}
