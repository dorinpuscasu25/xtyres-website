<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminProductManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_users_can_bulk_update_product_stock_and_catalog_visibility()
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $firstProduct = $this->createProduct(1, 12, true);
        $secondProduct = $this->createProduct(2, 8, true);

        $response = $this->actingAs($admin)
            ->from(route('admin.products.index'))
            ->post(route('admin.products.bulk-update'), [
                'product_ids' => [$firstProduct->id, $secondProduct->id],
                'apply_stock' => true,
                'stock_quantity' => 250,
                'apply_visibility' => true,
                'is_active' => false,
            ]);

        $response->assertRedirect(route('admin.products.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('products', [
            'id' => $firstProduct->id,
            'stock_quantity' => 250,
            'is_active' => false,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $secondProduct->id,
            'stock_quantity' => 250,
            'is_active' => false,
        ]);
    }

    public function test_admin_products_index_respects_the_requested_per_page_value()
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        foreach (range(1, 30) as $index) {
            $this->createProduct($index, 10 + $index, true);
        }

        $this->actingAs($admin)
            ->get(route('admin.products.index', ['per_page' => 25]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/products/index')
                ->where('filters.per_page', 25)
                ->has('products.data', 25),
            );
    }

    private function createProduct(int $index, int $stockQuantity, bool $isActive): Product
    {
        $category = Category::query()->create([
            'name' => ['ro' => "Anvelope {$index}", 'ru' => "Шины {$index}"],
            'slug' => ['ro' => "anvelope-{$index}", 'ru' => "shiny-{$index}"],
            'description' => ['ro' => '', 'ru' => ''],
            'is_active' => true,
            'is_featured' => false,
            'menu_order' => 0,
        ]);

        $product = Product::query()->create([
            'name' => ['ro' => "Produs {$index}", 'ru' => "Товар {$index}"],
            'slug' => ['ro' => "produs-{$index}", 'ru' => "tovar-{$index}"],
            'short_description' => ['ro' => '', 'ru' => ''],
            'description' => ['ro' => '', 'ru' => ''],
            'meta_title' => ['ro' => '', 'ru' => ''],
            'meta_keywords' => ['ro' => '', 'ru' => ''],
            'meta_description' => ['ro' => '', 'ru' => ''],
            'sku' => "SKU-{$index}",
            'price' => 100 + $index,
            'compare_at_price' => null,
            'stock_quantity' => $stockQuantity,
            'image_path' => null,
            'is_active' => $isActive,
            'is_featured' => false,
            'sort_order' => 0,
        ]);

        $product->categories()->sync([$category->id]);

        return $product;
    }
}
