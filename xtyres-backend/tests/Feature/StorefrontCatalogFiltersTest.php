<?php

namespace Tests\Feature;

use App\Models\Attribute;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontCatalogFiltersTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_filters_keep_only_the_most_relevant_attribute_when_slugs_are_duplicated(): void
    {
        $category = Category::query()->create([
            'name' => ['ro' => 'Anvelope', 'ru' => 'Шины'],
            'slug' => ['ro' => 'anvelope', 'ru' => 'shiny'],
            'description' => ['ro' => '', 'ru' => ''],
            'is_active' => true,
            'is_featured' => false,
            'menu_order' => 0,
        ]);

        $legacyWidth = $this->createFilterableAttribute('Lățime veche', 'latime', 1, $category);
        $activeWidth = $this->createFilterableAttribute('Lățime', 'latime', 2, $category);

        $this->createProductWithNumberAttribute('SKU-LEGACY', $category, $legacyWidth, 205);
        $this->createProductWithNumberAttribute('SKU-NEW-1', $category, $activeWidth, 225);
        $this->createProductWithNumberAttribute('SKU-NEW-2', $category, $activeWidth, 235);
        $this->createProductWithNumberAttribute('SKU-NEW-3', $category, $activeWidth, 245);

        $response = $this->getJson('/api/storefront/catalog?locale=ro&category=anvelope');

        $response->assertOk();

        $attributes = collect($response->json('filters.attributes'));
        $widthFilters = $attributes->where('slug', 'latime')->values();

        $this->assertCount(1, $widthFilters);
        $this->assertSame($activeWidth->id, $widthFilters->first()['id']);
        $this->assertSame([225, 235, 245], $widthFilters->first()['values']);
    }

    public function test_catalog_filters_fall_back_to_number_when_attribute_type_is_misconfigured(): void
    {
        $category = Category::query()->create([
            'name' => ['ro' => 'Anvelope', 'ru' => 'Шины'],
            'slug' => ['ro' => 'anvelope', 'ru' => 'shiny'],
            'description' => ['ro' => '', 'ru' => ''],
            'is_active' => true,
            'is_featured' => false,
            'menu_order' => 0,
        ]);

        $width = $this->createFilterableAttribute('Lățime', 'latime', 1, $category, 'select');

        $this->createProductWithNumberAttribute('SKU-1', $category, $width, 205);
        $this->createProductWithNumberAttribute('SKU-2', $category, $width, 225);

        $response = $this->getJson('/api/storefront/catalog?locale=ro&category=anvelope');

        $response->assertOk();

        $attributes = collect($response->json('filters.attributes'));
        $widthFilter = $attributes->firstWhere('slug', 'latime');

        $this->assertNotNull($widthFilter);
        $this->assertSame('number', $widthFilter['type']);
        $this->assertSame([205, 225], $widthFilter['values']);
    }

    private function createFilterableAttribute(
        string $name,
        string $slug,
        int $sortOrder,
        Category $category,
        string $type = 'number',
    ): Attribute
    {
        $attribute = Attribute::query()->create([
            'name' => ['ro' => $name, 'ru' => $name],
            'slug' => ['ro' => $slug, 'ru' => $slug],
            'description' => ['ro' => '', 'ru' => ''],
            'type' => $type,
            'is_filterable' => true,
            'is_required' => false,
            'is_active' => true,
            'sort_order' => $sortOrder,
        ]);

        $attribute->categories()->sync([$category->id]);

        return $attribute;
    }

    private function createProductWithNumberAttribute(
        string $sku,
        Category $category,
        Attribute $attribute,
        int $value,
    ): Product {
        $product = Product::query()->create([
            'name' => ['ro' => $sku, 'ru' => $sku],
            'slug' => ['ro' => $sku, 'ru' => $sku],
            'short_description' => ['ro' => '', 'ru' => ''],
            'description' => ['ro' => '', 'ru' => ''],
            'meta_title' => ['ro' => '', 'ru' => ''],
            'meta_keywords' => ['ro' => '', 'ru' => ''],
            'meta_description' => ['ro' => '', 'ru' => ''],
            'sku' => $sku,
            'price' => 100,
            'compare_at_price' => null,
            'stock_quantity' => 10,
            'image_path' => null,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 0,
        ]);

        $product->categories()->sync([$category->id]);
        $product->attributeValues()->create([
            'attribute_id' => $attribute->id,
            'number_value' => $value,
            'sort_order' => 0,
        ]);

        return $product;
    }
}
