<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute as ProductAttribute;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $products = Product::query()
            ->with(['brand', 'primaryCategory', 'categories', 'images'])
            ->orderByDesc('created_at');

        if ($search !== '') {
            $products->where(function (Builder $query) use ($search) {
                $this->applyTranslatableSearch($query, ['name', 'short_description'], $search);
                $query->orWhere('sku', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('admin/products/index', [
            'filters' => [
                'search' => $search,
            ],
            'products' => $products->paginate(10)->withQueryString()->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->getTranslations('name'),
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'compare_at_price' => $product->compare_at_price ? (float) $product->compare_at_price : null,
                'stock_quantity' => $product->stock_quantity,
                'brand' => $product->brand ? $product->brand->getTranslations('name') : null,
                'primary_category' => $product->primaryCategory ? $product->primaryCategory->getTranslations('name') : null,
                'categories_count' => $product->categories->count(),
                'image_url' => $product->image_url,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'mode' => 'create',
            'product' => [
                'name' => ['ro' => '', 'ru' => ''],
                'slug' => ['ro' => '', 'ru' => ''],
                'short_description' => ['ro' => '', 'ru' => ''],
                'description' => ['ro' => '', 'ru' => ''],
                'meta_title' => ['ro' => '', 'ru' => ''],
                'meta_keywords' => ['ro' => '', 'ru' => ''],
                'meta_description' => ['ro' => '', 'ru' => ''],
                'sku' => '',
                'brand_id' => null,
                'primary_category_id' => null,
                'category_ids' => [],
                'price' => '',
                'compare_at_price' => '',
                'stock_quantity' => 0,
                'gallery_images' => [],
                'gallery_order' => [],
                'new_images' => [],
                'new_image_keys' => [],
                'removed_image_ids' => [],
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 0,
                'attribute_values' => [],
            ],
            'brands' => $this->brandOptions(),
            'categoryTree' => $this->categoryTree(),
            'attributes' => $this->attributeDefinitions(),
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load(['categories', 'attributeValues.option', 'attributeValues.attribute', 'images']);

        return Inertia::render('admin/products/form', [
            'mode' => 'edit',
            'product' => [
                'id' => $product->id,
                'name' => $product->getTranslations('name'),
                'slug' => $product->getTranslations('slug'),
                'short_description' => $product->getTranslations('short_description'),
                'description' => $product->getTranslations('description'),
                'meta_title' => $product->getTranslations('meta_title'),
                'meta_keywords' => $product->getTranslations('meta_keywords'),
                'meta_description' => $product->getTranslations('meta_description'),
                'sku' => $product->sku,
                'brand_id' => $product->brand_id,
                'primary_category_id' => $product->primary_category_id,
                'category_ids' => $product->categories->pluck('id')->all(),
                'price' => (string) $product->price,
                'compare_at_price' => $product->compare_at_price ? (string) $product->compare_at_price : '',
                'stock_quantity' => $product->stock_quantity,
                'gallery_images' => $product->images->map(fn (ProductImage $image) => [
                    'id' => $image->id,
                    'image_url' => $image->image_url,
                    'sort_order' => $image->sort_order,
                ])->values()->all(),
                'gallery_order' => $product->images
                    ->map(fn (ProductImage $image) => 'existing:'.$image->id)
                    ->values()
                    ->all(),
                'new_images' => [],
                'new_image_keys' => [],
                'removed_image_ids' => [],
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'sort_order' => $product->sort_order,
                'attribute_values' => $this->mapAttributeValues($product),
            ],
            'brands' => $this->brandOptions(),
            'categoryTree' => $this->categoryTree(),
            'attributes' => $this->attributeDefinitions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request, null);

        $product = Product::create([
            ...Arr::except($validated, ['category_ids', 'attribute_values', 'new_images', 'new_image_keys', 'gallery_order', 'removed_image_ids']),
            'image_path' => null,
        ]);

        $product->categories()->sync($validated['category_ids']);
        $this->syncAttributeValues($product, $validated['attribute_values'] ?? []);
        $this->syncGalleryImages($product, $validated, $request);

        return to_route('admin.products.index')->with('success', 'Produsul a fost creat.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $this->validatePayload($request, $product->id);

        $product->update([
            ...Arr::except($validated, ['category_ids', 'attribute_values', 'new_images', 'new_image_keys', 'gallery_order', 'removed_image_ids']),
        ]);

        $product->categories()->sync($validated['category_ids']);
        $this->syncAttributeValues($product, $validated['attribute_values'] ?? []);
        $this->syncGalleryImages($product, $validated, $request);

        return to_route('admin.products.index')->with('success', 'Produsul a fost actualizat.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $this->replacePublicFile(null, $product->image_path, 'products', true);
        $product->delete();

        return to_route('admin.products.index')->with('success', 'Produsul a fost șters.');
    }

    private function validatePayload(Request $request, ?int $productId): array
    {
        return $request->validate([
            'name.ro' => ['required', 'string', 'max:255'],
            'name.ru' => ['required', 'string', 'max:255'],
            'slug.ro' => ['nullable', 'string', 'max:255'],
            'slug.ru' => ['nullable', 'string', 'max:255'],
            'short_description.ro' => ['nullable', 'string'],
            'short_description.ru' => ['nullable', 'string'],
            'description.ro' => ['nullable', 'string'],
            'description.ru' => ['nullable', 'string'],
            'meta_title.ro' => ['nullable', 'string', 'max:255'],
            'meta_title.ru' => ['nullable', 'string', 'max:255'],
            'meta_keywords.ro' => ['nullable', 'string'],
            'meta_keywords.ru' => ['nullable', 'string'],
            'meta_description.ro' => ['nullable', 'string'],
            'meta_description.ru' => ['nullable', 'string'],
            'sku' => ['required', 'string', 'max:120', Rule::unique('products', 'sku')->ignore($productId)],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'primary_category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*.id' => ['required', 'integer'],
            'gallery_images.*.image_url' => ['nullable', 'string'],
            'gallery_order' => ['nullable', 'array'],
            'gallery_order.*' => ['string'],
            'new_images' => ['nullable', 'array'],
            'new_images.*' => ['image', 'max:4096'],
            'new_image_keys' => ['nullable', 'array'],
            'new_image_keys.*' => ['string'],
            'removed_image_ids' => ['nullable', 'array'],
            'removed_image_ids.*' => ['integer'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'attribute_values' => ['nullable', 'array'],
            'attribute_values.*.attribute_id' => ['required', 'integer', 'exists:attributes,id'],
            'attribute_values.*.type' => ['required', 'in:select,multi_select,text,textarea,number,boolean'],
            'attribute_values.*.text_value.ro' => ['nullable', 'string'],
            'attribute_values.*.text_value.ru' => ['nullable', 'string'],
            'attribute_values.*.number_value' => ['nullable', 'numeric'],
            'attribute_values.*.boolean_value' => ['nullable', 'boolean'],
            'attribute_values.*.option_ids' => ['nullable', 'array'],
            'attribute_values.*.option_ids.*' => ['integer', 'exists:attribute_options,id'],
        ]);
    }

    private function syncGalleryImages(Product $product, array $validated, Request $request): void
    {
        $removedIds = collect($validated['removed_image_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $existingImages = $product->images()->get()->keyBy('id');

        foreach ($removedIds as $removedId) {
            /** @var ProductImage|null $image */
            $image = $existingImages->get($removedId);

            if (! $image) {
                continue;
            }

            Storage::disk('public')->delete($image->path);
            $image->delete();
            $existingImages->forget($removedId);
        }

        $newImageKeys = collect($validated['new_image_keys'] ?? [])->values();
        $newImageFiles = collect($request->file('new_images', []))->values();
        $newImagesByKey = $newImageKeys->mapWithKeys(function ($key, $index) use ($newImageFiles) {
            return [$key => $newImageFiles->get($index)];
        });

        $orderedTokens = collect($validated['gallery_order'] ?? [])
            ->filter(fn ($token) => is_string($token) && str_contains($token, ':'))
            ->values();

        $sortOrder = 0;
        $placedExistingIds = [];

        foreach ($orderedTokens as $token) {
            [$type, $identifier] = explode(':', $token, 2);

            if ($type === 'existing') {
                $imageId = (int) $identifier;
                /** @var ProductImage|null $image */
                $image = $existingImages->get($imageId);

                if (! $image) {
                    continue;
                }

                $image->update(['sort_order' => $sortOrder]);
                $placedExistingIds[] = $imageId;
                $sortOrder++;

                continue;
            }

            if ($type === 'new') {
                $file = $newImagesByKey->get($identifier);

                if (! $file) {
                    continue;
                }

                ProductImage::query()->create([
                    'product_id' => $product->id,
                    'path' => $this->storePublicFile($file, 'products'),
                    'sort_order' => $sortOrder,
                ]);

                $sortOrder++;
            }
        }

        $remainingImages = $existingImages
            ->reject(fn (ProductImage $image, int $imageId) => in_array($imageId, $placedExistingIds, true))
            ->sortBy(fn (ProductImage $image) => sprintf('%010d-%010d', $image->sort_order, $image->id));

        foreach ($remainingImages as $image) {
            $image->update(['sort_order' => $sortOrder]);
            $sortOrder++;
        }

        $product->load('images');
        $product->update([
            'image_path' => $product->images->first()?->path,
        ]);
    }

    private function syncAttributeValues(Product $product, array $attributeValues): void
    {
        $product->attributeValues()->delete();

        foreach ($attributeValues as $index => $item) {
            $type = $item['type'];
            $attributeId = (int) $item['attribute_id'];

            if (in_array($type, ['select', 'multi_select'], true)) {
                foreach (($item['option_ids'] ?? []) as $optionId) {
                    ProductAttributeValue::query()->create([
                        'product_id' => $product->id,
                        'attribute_id' => $attributeId,
                        'attribute_option_id' => $optionId,
                        'sort_order' => $index,
                    ]);
                }

                continue;
            }

            if (in_array($type, ['text', 'textarea'], true)) {
                $textValue = $item['text_value'] ?? [];

                if (! filled($textValue['ro'] ?? null) && ! filled($textValue['ru'] ?? null)) {
                    continue;
                }

                ProductAttributeValue::query()->create([
                    'product_id' => $product->id,
                    'attribute_id' => $attributeId,
                    'text_value' => $textValue,
                    'sort_order' => $index,
                ]);

                continue;
            }

            if ($type === 'number' && filled($item['number_value'] ?? null)) {
                ProductAttributeValue::query()->create([
                    'product_id' => $product->id,
                    'attribute_id' => $attributeId,
                    'number_value' => $item['number_value'],
                    'sort_order' => $index,
                ]);

                continue;
            }

            if ($type === 'boolean' && array_key_exists('boolean_value', $item)) {
                ProductAttributeValue::query()->create([
                    'product_id' => $product->id,
                    'attribute_id' => $attributeId,
                    'boolean_value' => (bool) $item['boolean_value'],
                    'sort_order' => $index,
                ]);
            }
        }
    }

    private function mapAttributeValues(Product $product): array
    {
        $grouped = [];

        foreach ($product->attributeValues as $value) {
            $attribute = $value->attribute;

            if (! $attribute) {
                continue;
            }

            $grouped[$attribute->id] ??= [
                'attribute_id' => $attribute->id,
                'type' => $attribute->type,
                'option_ids' => [],
                'text_value' => ['ro' => '', 'ru' => ''],
                'number_value' => '',
                'boolean_value' => false,
            ];

            if ($value->attribute_option_id) {
                $grouped[$attribute->id]['option_ids'][] = $value->attribute_option_id;
            } elseif ($value->text_value) {
                $grouped[$attribute->id]['text_value'] = $value->getTranslations('text_value');
            } elseif (! is_null($value->number_value)) {
                $grouped[$attribute->id]['number_value'] = (string) $value->number_value;
            } elseif (! is_null($value->boolean_value)) {
                $grouped[$attribute->id]['boolean_value'] = $value->boolean_value;
            }
        }

        return array_values($grouped);
    }

    private function brandOptions(): array
    {
        return Brand::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Brand $brand) => [
                'id' => $brand->id,
                'name' => $brand->getTranslations('name'),
            ])
            ->all();
    }

    private function categoryTree(): array
    {
        return Category::query()
            ->with('childrenRecursive')
            ->whereNull('parent_id')
            ->orderBy('menu_order')
            ->get()
            ->map(fn (Category $category) => $this->mapCategoryNode($category))
            ->all();
    }

    private function mapCategoryNode(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->getTranslations('name'),
            'children' => $category->childrenRecursive->map(fn (Category $child) => $this->mapCategoryNode($child))->all(),
        ];
    }

    private function attributeDefinitions(): array
    {
        return ProductAttribute::query()
            ->with(['options', 'categories'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (ProductAttribute $attribute) => [
                'id' => $attribute->id,
                'name' => $attribute->getTranslations('name'),
                'slug' => $attribute->getTranslations('slug'),
                'description' => $attribute->getTranslations('description'),
                'type' => $attribute->type,
                'is_filterable' => $attribute->is_filterable,
                'is_required' => $attribute->is_required,
                'category_ids' => $attribute->categories->pluck('id')->all(),
                'options' => $attribute->options->map(fn ($option) => [
                    'id' => $option->id,
                    'value' => $option->getTranslations('value'),
                ])->all(),
            ])
            ->all();
    }
}
