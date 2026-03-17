<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductImage;
use App\Models\StoreSetting;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class StorefrontController extends Controller
{
    public function bootstrap(Request $request): JsonResponse
    {
        $locale = $this->resolveLocale($request);

        return response()->json([
            'locale' => $locale,
            'settings' => $this->settingsPayload(StoreSetting::current(), $locale),
            'menu' => $this->navigationPayload($locale),
            'brands' => Brand::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->take(20)
                ->get()
                ->map(fn (Brand $brand) => $this->brandPayload($brand, $locale))
                ->all(),
        ]);
    }

    public function home(Request $request): JsonResponse
    {
        $locale = $this->resolveLocale($request);

        $featuredProducts = Product::query()
            ->with(['brand', 'categories', 'images', 'attributeValues.option', 'attributeValues.attribute'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->take(8)
            ->get()
            ->map(fn (Product $product) => $this->productCardPayload($product, $locale))
            ->all();

        $featuredCategories = Category::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('menu_order')
            ->take(6)
            ->get()
            ->map(fn (Category $category) => $this->categoryPayload($category, $locale, false))
            ->all();

        return response()->json([
            'featuredProducts' => $featuredProducts,
            'featuredCategories' => $featuredCategories,
            'brands' => Brand::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->take(12)
                ->get()
                ->map(fn (Brand $brand) => $this->brandPayload($brand, $locale))
                ->all(),
        ]);
    }

    public function settings(Request $request): JsonResponse
    {
        return response()->json([
            'settings' => $this->settingsPayload(StoreSetting::current(), $this->resolveLocale($request)),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $locale = $this->resolveLocale($request);
        $query = trim((string) $request->query('q', ''));

        if ($query === '') {
            return response()->json([
                'products' => [],
            ]);
        }

        $products = Product::query()
            ->with(['brand', 'categories', 'images', 'attributeValues.option', 'attributeValues.attribute'])
            ->where('is_active', true);

        $products->where(function (Builder $builder) use ($query) {
            $this->applyTranslatableSearch($builder, ['name', 'short_description'], $query);
            $builder->orWhere('sku', 'like', '%'.$query.'%');
        });

        return response()->json([
            'products' => $products
                ->limit(6)
                ->get()
                ->map(fn (Product $product) => $this->productCardPayload($product, $locale))
                ->all(),
        ]);
    }

    public function product(Request $request, string $productKey): JsonResponse
    {
        $locale = $this->resolveLocale($request);

        $product = Product::query()
            ->with(['brand', 'categories', 'primaryCategory', 'images', 'attributeValues.attribute', 'attributeValues.option'])
            ->where('is_active', true)
            ->when(
                ctype_digit($productKey),
                fn (Builder $query) => $query->whereKey((int) $productKey),
                function (Builder $query) use ($productKey, $locale) {
                    $this->applyTranslatableExactMatch($query, 'slug', $productKey, $locale);
                }
            )
            ->firstOrFail();

        $similarProducts = Product::query()
            ->with(['brand', 'categories', 'images', 'attributeValues.option', 'attributeValues.attribute'])
            ->where('is_active', true)
            ->whereKeyNot($product->id)
            ->when($product->primary_category_id, fn (Builder $query) => $query->where('primary_category_id', $product->primary_category_id))
            ->take(4)
            ->get()
            ->map(fn (Product $item) => $this->productCardPayload($item, $locale))
            ->all();

        return response()->json([
            'product' => [
                ...$this->productCardPayload($product, $locale),
                'shortDescription' => $this->localize($product->getTranslations('short_description'), $locale),
                'description' => $this->localize($product->getTranslations('description'), $locale),
                'metaTitle' => $this->localize($product->getTranslations('meta_title'), $locale),
                'metaKeywords' => $this->localize($product->getTranslations('meta_keywords'), $locale),
                'metaDescription' => $this->localize($product->getTranslations('meta_description'), $locale),
                'sku' => $product->sku,
                'stockQuantity' => $product->stock_quantity,
                'gallery' => $product->images
                    ->map(fn (ProductImage $image) => $image->image_url)
                    ->filter()
                    ->values()
                    ->all(),
                'categories' => $product->categories->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $this->localize($category->getTranslations('name'), $locale),
                    'slug' => $this->localize($category->getTranslations('slug'), $locale),
                ])->all(),
                'specifications' => $this->productSpecifications($product, $locale),
            ],
            'similarProducts' => $similarProducts,
        ]);
    }

    public function catalog(Request $request): JsonResponse
    {
        $locale = $this->resolveLocale($request);
        $perPage = max(1, min(24, (int) $request->query('per_page', 12)));
        $page = max(1, (int) $request->query('page', 1));
        $search = trim((string) $request->query('q', ''));
        $sort = (string) $request->query('sort', 'featured');
        $categorySlug = $request->query('category');
        $brandIds = collect(explode(',', (string) $request->query('brand_ids', '')))
            ->filter()
            ->map(fn (string $id) => (int) $id)
            ->all();
        $priceMin = $request->query('price_min');
        $priceMax = $request->query('price_max');
        $filters = json_decode((string) $request->query('filters', '[]'), true);

        $category = null;
        $categoryIds = [];

        if (filled($categorySlug)) {
            $category = Category::query()
                ->where('is_active', true)
                ->tap(fn (Builder $query) => $this->applyTranslatableExactMatch($query, 'slug', (string) $categorySlug, $locale))
                ->first();

            if ($category) {
                $categoryIds = [$category->id, ...$this->descendantIds($category)];
            }
        }

        $query = Product::query()
            ->with(['brand', 'categories', 'images', 'attributeValues.option', 'attributeValues.attribute'])
            ->where('is_active', true);

        if ($categoryIds !== []) {
            $query->whereHas('categories', fn (Builder $builder) => $builder->whereIn('categories.id', $categoryIds));
        }

        if ($search !== '') {
            $this->applyTranslatableSearch($query, ['name', 'short_description'], $search);
        }

        if ($brandIds !== []) {
            $query->whereIn('brand_id', $brandIds);
        }

        if (filled($priceMin)) {
            $query->where('price', '>=', (float) $priceMin);
        }

        if (filled($priceMax)) {
            $query->where('price', '<=', (float) $priceMax);
        }

        $this->applyAttributeFilters($query, is_array($filters) ? $filters : []);
        $this->applySorting($query, $sort, $locale);

        $paginated = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

        $filterSourceQuery = Product::query()
            ->with(['brand', 'categories', 'images', 'attributeValues.option', 'attributeValues.attribute'])
            ->where('is_active', true);

        if ($categoryIds !== []) {
            $filterSourceQuery->whereHas('categories', fn (Builder $builder) => $builder->whereIn('categories.id', $categoryIds));
        }

        if ($search !== '') {
            $this->applyTranslatableSearch($filterSourceQuery, ['name', 'short_description'], $search);
        }

        $filterSourceProducts = $filterSourceQuery->get();

        return response()->json([
            'category' => $category ? $this->categoryPayload($category, $locale, false) : null,
            'products' => $paginated->getCollection()->map(fn (Product $product) => $this->productCardPayload($product, $locale))->all(),
            'filters' => $this->filtersPayload($filterSourceProducts, $categoryIds, $locale),
            'pagination' => [
                'currentPage' => $paginated->currentPage(),
                'lastPage' => $paginated->lastPage(),
                'perPage' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function storeOrder(Request $request): JsonResponse
    {
        $locale = $this->resolveLocale($request);

        $validated = $request->validate([
            'customer.first_name' => ['required', 'string', 'max:120'],
            'customer.last_name' => ['required', 'string', 'max:120'],
            'customer.email' => ['nullable', 'email', 'max:255'],
            'customer.phone' => ['required', 'string', 'max:60'],
            'customer.city' => ['required', 'string', 'max:120'],
            'customer.street' => ['required', 'string', 'max:255'],
            'customer.street_number' => ['required', 'string', 'max:60'],
            'customer.postal_code' => ['nullable', 'string', 'max:60'],
            'payment_method' => ['required', 'in:cash,transfer,card'],
            'note' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $productIds = collect($validated['items'])->pluck('product_id')->all();
        $products = Product::query()
            ->with(['images', 'attributeValues.attribute', 'attributeValues.option'])
            ->where('is_active', true)
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        if (count($productIds) !== $products->count()) {
            throw new HttpResponseException(response()->json([
                'message' => 'Unele produse nu mai sunt disponibile.',
            ], 422));
        }

        foreach ($validated['items'] as $item) {
            /** @var Product $product */
            $product = $products->get($item['product_id']);

            if (! $product || $product->stock_quantity < $item['quantity']) {
                throw new HttpResponseException(response()->json([
                    'message' => 'Stoc insuficient pentru unul dintre produse.',
                ], 422));
            }
        }

        $order = DB::transaction(function () use ($validated, $products, $locale) {
            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                /** @var Product $product */
                $product = $products->get($item['product_id']);
                $subtotal += ((float) $product->price) * $item['quantity'];
            }

            $order = Order::create([
                'order_number' => 'TMP-'.Str::uuid(),
                'status' => 'new',
                'locale' => $locale,
                'customer_first_name' => $validated['customer']['first_name'],
                'customer_last_name' => $validated['customer']['last_name'],
                'customer_email' => $validated['customer']['email'] ?? null,
                'customer_phone' => $validated['customer']['phone'],
                'city' => $validated['customer']['city'],
                'street' => $validated['customer']['street'],
                'street_number' => $validated['customer']['street_number'],
                'postal_code' => $validated['customer']['postal_code'] ?? null,
                'payment_method' => $validated['payment_method'],
                'currency' => 'MDL',
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'note' => $validated['note'] ?? null,
            ]);

            $order->update([
                'order_number' => 'XT-'.now()->format('Ymd').'-'.str_pad((string) $order->id, 5, '0', STR_PAD_LEFT),
            ]);

            foreach ($validated['items'] as $item) {
                /** @var Product $product */
                $product = $products->get($item['product_id']);
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $product->price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->getTranslations('name'),
                    'sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $unitPrice * $quantity,
                    'attributes_snapshot' => $this->productSpecifications($product, $locale),
                ]);

                $product->decrement('stock_quantity', $quantity);
            }

            return $order;
        });

        return response()->json([
            'order' => [
                'id' => $order->id,
                'orderNumber' => $order->order_number,
                'status' => $order->status,
                'total' => (float) $order->total,
            ],
        ], 201);
    }

    private function resolveLocale(Request $request): string
    {
        $locale = (string) $request->query('locale', $this->defaultLocale());

        return in_array($locale, $this->supportedLocales(), true) ? $locale : $this->defaultLocale();
    }

    private function navigationPayload(string $locale): array
    {
        return Category::query()
            ->with('childrenRecursive')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('menu_order')
            ->get()
            ->map(fn (Category $category) => $this->categoryPayload($category, $locale))
            ->all();
    }

    private function categoryPayload(Category $category, string $locale, bool $withChildren = true): array
    {
        $category->loadMissing('childrenRecursive');

        return [
            'id' => $category->id,
            'name' => $this->localize($category->getTranslations('name'), $locale),
            'slug' => $this->localize($category->getTranslations('slug'), $locale),
            'description' => $this->localize($category->getTranslations('description'), $locale),
            'imageUrl' => $category->image_url,
            'children' => $withChildren
                ? $category->childrenRecursive
                    ->where('is_active', true)
                    ->sortBy('menu_order')
                    ->map(fn (Category $child) => $this->categoryPayload($child, $locale))
                    ->values()
                    ->all()
                : [],
        ];
    }

    private function brandPayload(Brand $brand, string $locale): array
    {
        return [
            'id' => $brand->id,
            'name' => $this->localize($brand->getTranslations('name'), $locale),
            'slug' => $this->localize($brand->getTranslations('slug'), $locale),
            'description' => $this->localize($brand->getTranslations('description'), $locale),
            'logoUrl' => $brand->logo_url,
        ];
    }

    private function productCardPayload(Product $product, string $locale): array
    {
        $attributeMap = [];

        foreach ($this->productSpecifications($product, $locale) as $specification) {
            $attributeMap[$specification['slug']] = $specification['value'];
        }

        return [
            'id' => $product->id,
            'slug' => $this->localize($product->getTranslations('slug'), $locale),
            'name' => $this->localize($product->getTranslations('name'), $locale),
            'shortDescription' => $this->localize($product->getTranslations('short_description'), $locale),
            'price' => (float) $product->price,
            'oldPrice' => $product->compare_at_price ? (float) $product->compare_at_price : null,
            'badge' => $product->compare_at_price && $product->compare_at_price > $product->price
                ? 'Reducere'
                : ($product->is_featured ? 'Nou' : null),
            'brand' => $product->brand ? $this->localize($product->brand->getTranslations('name'), $locale) : null,
            'brandId' => $product->brand_id,
            'imageUrl' => $product->image_url,
            'attributes' => $attributeMap,
            'primaryCategory' => $product->primaryCategory ? [
                'id' => $product->primaryCategory->id,
                'name' => $this->localize($product->primaryCategory->getTranslations('name'), $locale),
                'slug' => $this->localize($product->primaryCategory->getTranslations('slug'), $locale),
            ] : null,
        ];
    }

    private function settingsPayload(StoreSetting $settings, string $locale): array
    {
        return [
            'siteName' => $this->localize($settings->getTranslations('site_name'), $locale),
            'siteDescription' => $this->localize($settings->getTranslations('site_description'), $locale),
            'footerText' => $this->localize($settings->getTranslations('footer_text'), $locale),
            'contactAddress' => $this->localize($settings->getTranslations('contact_address'), $locale),
            'workingHours' => $this->localize($settings->getTranslations('working_hours'), $locale),
            'emails' => $settings->emails ?? [],
            'phones' => $settings->phones ?? [],
            'socialLinks' => $settings->social_links ?? [],
            'mapEmbedUrl' => $settings->map_embed_url,
            'headerLogoUrl' => $settings->header_logo_url,
            'footerLogoUrl' => $settings->footer_logo_url,
        ];
    }

    private function productSpecifications(Product $product, string $locale): array
    {
        return $product->attributeValues
            ->sortBy('sort_order')
            ->map(function (ProductAttributeValue $value) use ($locale) {
                $attribute = $value->attribute;

                if (! $attribute) {
                    return null;
                }

                $displayValue = null;

                if ($value->option) {
                    $displayValue = $this->localize($value->option->getTranslations('value'), $locale);
                } elseif ($value->text_value) {
                    $displayValue = $this->localize($value->getTranslations('text_value'), $locale);
                } elseif (! is_null($value->number_value)) {
                    $displayValue = (string) ((float) $value->number_value);
                } elseif (! is_null($value->boolean_value)) {
                    $displayValue = $value->boolean_value ? 'Da' : 'Nu';
                }

                return $displayValue ? [
                    'id' => $attribute->id,
                    'slug' => $this->localize($attribute->getTranslations('slug'), $locale),
                    'label' => $this->localize($attribute->getTranslations('name'), $locale),
                    'value' => $displayValue,
                ] : null;
            })
            ->filter()
            ->values()
            ->all();
    }

    private function applySorting(Builder $query, string $sort, string $locale): void
    {
        if ($sort === 'price_asc') {
            $query->orderBy('price');

            return;
        }

        if ($sort === 'price_desc') {
            $query->orderByDesc('price');

            return;
        }

        if ($sort === 'name_asc') {
            if (config('database.default') === 'pgsql') {
                $query->orderByRaw("LOWER(COALESCE(name->>?, '')) ASC", [$locale]);
            } else {
                $query->orderBy('name->'.$locale);
            }

            return;
        }

        if ($sort === 'newest') {
            $query->latest();

            return;
        }

        $query->orderByDesc('is_featured')->orderBy('sort_order')->latest();
    }

    private function applyAttributeFilters(Builder $query, array $filters): void
    {
        foreach ($filters as $filter) {
            $attributeId = $filter['attribute_id'] ?? null;
            $type = $filter['type'] ?? null;

            if (! $attributeId || ! $type) {
                continue;
            }

            if (in_array($type, ['select', 'multi_select'], true)) {
                $values = array_filter($filter['values'] ?? []);

                if ($values === []) {
                    continue;
                }

                $query->whereHas('attributeValues', function (Builder $builder) use ($attributeId, $values) {
                    $builder->where('attribute_id', $attributeId)
                        ->whereIn('attribute_option_id', $values);
                });

                continue;
            }

            if ($type === 'number') {
                $min = $filter['min'] ?? null;
                $max = $filter['max'] ?? null;

                if ($min === null && $max === null) {
                    continue;
                }

                $query->whereHas('attributeValues', function (Builder $builder) use ($attributeId, $min, $max) {
                    $builder->where('attribute_id', $attributeId);

                    if ($min !== null) {
                        $builder->where('number_value', '>=', (float) $min);
                    }

                    if ($max !== null) {
                        $builder->where('number_value', '<=', (float) $max);
                    }
                });

                continue;
            }

            if ($type === 'boolean' && array_key_exists('value', $filter)) {
                $query->whereHas('attributeValues', function (Builder $builder) use ($attributeId, $filter) {
                    $builder->where('attribute_id', $attributeId)
                        ->where('boolean_value', (bool) $filter['value']);
                });
            }
        }
    }

    private function filtersPayload(Collection $products, array $categoryIds, string $locale): array
    {
        $brands = $products
            ->filter(fn (Product $product) => $product->brand)
            ->groupBy('brand_id')
            ->map(function (Collection $items) use ($locale) {
                /** @var Product $product */
                $product = $items->first();

                return [
                    'id' => $product->brand_id,
                    'label' => $this->localize($product->brand->getTranslations('name'), $locale),
                    'count' => $items->count(),
                ];
            })
            ->values()
            ->all();

        $attributeQuery = Attribute::query()
            ->with('options')
            ->where('is_active', true)
            ->where('is_filterable', true)
            ->orderBy('sort_order');

        if ($categoryIds !== []) {
            $attributeQuery->whereHas('categories', fn (Builder $builder) => $builder->whereIn('categories.id', $categoryIds));
        }

        $attributes = $attributeQuery->get()->map(function (Attribute $attribute) use ($products, $locale) {
            $relatedValues = $products
                ->flatMap(fn (Product $product) => $product->attributeValues)
                ->where('attribute_id', $attribute->id);

            $payload = [
                'id' => $attribute->id,
                'slug' => $this->localize($attribute->getTranslations('slug'), $locale),
                'label' => $this->localize($attribute->getTranslations('name'), $locale),
                'type' => $attribute->type,
            ];

            if (in_array($attribute->type, ['select', 'multi_select'], true)) {
                $optionCounts = $relatedValues
                    ->filter(fn (ProductAttributeValue $value) => $value->option)
                    ->groupBy('attribute_option_id')
                    ->map(fn (Collection $items) => $items->count());

                $payload['options'] = $attribute->options
                    ->filter(fn ($option) => $optionCounts->has($option->id))
                    ->map(fn ($option) => [
                        'id' => $option->id,
                        'label' => $this->localize($option->getTranslations('value'), $locale),
                        'count' => $optionCounts->get($option->id),
                    ])
                    ->values()
                    ->all();
            }

            if ($attribute->type === 'number') {
                $numbers = $relatedValues
                    ->pluck('number_value')
                    ->filter(fn ($number) => ! is_null($number))
                    ->map(fn ($number) => (float) $number);

                $payload['min'] = $numbers->min();
                $payload['max'] = $numbers->max();
                $payload['values'] = $numbers->unique()->sort()->values()->all();
            }

            if ($attribute->type === 'boolean') {
                $payload['options'] = [
                    ['id' => 1, 'label' => 'Da', 'value' => true, 'count' => $relatedValues->where('boolean_value', true)->count()],
                    ['id' => 0, 'label' => 'Nu', 'value' => false, 'count' => $relatedValues->where('boolean_value', false)->count()],
                ];
            }

            return $payload;
        })->filter(function (array $attribute) {
            if (in_array($attribute['type'], ['select', 'multi_select', 'boolean'], true)) {
                return ! empty($attribute['options']);
            }

            if ($attribute['type'] === 'number') {
                return ! is_null($attribute['min']) || ! is_null($attribute['max']);
            }

            return false;
        })->values()->all();

        return [
            'brands' => $brands,
            'price' => [
                'min' => $products->min('price'),
                'max' => $products->max('price'),
            ],
            'attributes' => $attributes,
        ];
    }

    private function descendantIds(Category $category): array
    {
        $category->loadMissing('childrenRecursive');

        $ids = [];
        $walk = function (Category $node) use (&$walk, &$ids): void {
            foreach ($node->childrenRecursive as $child) {
                $ids[] = $child->id;
                $walk($child);
            }
        };

        $walk($category);

        return $ids;
    }
}
