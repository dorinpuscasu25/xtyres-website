<?php

namespace App\Support\Importers;

use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductImage;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class WooCommerceProductCsvImporter
{
    /**
     * @var array<string, Brand>
     */
    private array $brandCache = [];

    /**
     * @var array<string, Category>
     */
    private array $categoryCache = [];

    /**
     * @var array<string, Attribute>
     */
    private array $attributeCache = [];

    /**
     * @var array<string, AttributeOption>
     */
    private array $attributeOptionCache = [];

    /**
     * @var array<string, Product>
     */
    private array $productCache = [];

    /**
     * @param  array{
     *     limit?: int|null,
     *     dry_run?: bool,
     *     download_images?: bool,
     *     refresh_images?: bool,
     *     default_stock?: int,
     *     progress?: callable(string): void,
     * }  $options
     * @return array{
     *     processed: int,
     *     imported: int,
     *     updated: int,
     *     skipped: int,
     *     skipped_non_simple: int,
     *     failed: int,
     *     errors: list<string>,
     * }
     */
    public function import(string $filePath, array $options = []): array
    {
        if (! is_file($filePath)) {
            throw new RuntimeException("Fișierul CSV nu există: {$filePath}");
        }

        $options = [
            'limit' => null,
            'dry_run' => false,
            'download_images' => true,
            'refresh_images' => false,
            'default_stock' => 100,
            'progress' => null,
            ...$options,
        ];

        $this->bootstrapCaches();

        $summary = [
            'processed' => 0,
            'imported' => 0,
            'updated' => 0,
            'skipped' => 0,
            'skipped_non_simple' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        $rows = $this->rows($filePath);
        $limit = is_numeric($options['limit']) ? (int) $options['limit'] : null;

        foreach ($rows as $index => $row) {
            if ($limit !== null && $summary['processed'] >= $limit) {
                break;
            }

            $summary['processed']++;

            $type = Str::lower(trim((string) ($row['Tip'] ?? 'simple')));
            if ($type !== 'simple') {
                $summary['skipped']++;
                $summary['skipped_non_simple']++;
                $this->progress($options, "Rândul {$index}: tipul {$type} a fost omis.");

                continue;
            }

            try {
                $result = $this->importRow($row, $filePath, $options);
                $summary[$result]++;
            } catch (\Throwable $exception) {
                $summary['failed']++;
                $sku = trim((string) ($row['SKU'] ?? ''));
                $summary['errors'][] = ($sku !== '' ? "[{$sku}] " : '').$exception->getMessage();
                $this->progress($options, "Eroare la rândul {$index}".($sku !== '' ? " ({$sku})" : '').": {$exception->getMessage()}");
            }
        }

        return $summary;
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array{
     *     dry_run: bool,
     *     download_images: bool,
     *     refresh_images: bool,
     *     default_stock: int,
     *     progress?: callable(string): void,
     * }  $options
     */
    private function importRow(array $row, string $filePath, array $options): string
    {
        $sku = trim((string) ($row['SKU'] ?? ''));

        if ($sku === '') {
            throw new RuntimeException('Produsul nu are SKU.');
        }

        $productName = trim((string) ($row['Nume'] ?? ''));

        if ($productName === '') {
            throw new RuntimeException('Produsul nu are nume.');
        }

        $existingProduct = $this->productCache[$sku] ?? Product::query()->where('sku', $sku)->first();
        $isUpdate = $existingProduct instanceof Product;

        $categoryPaths = $this->parseCategoryPaths((string) ($row['Categorii'] ?? ''));
        $categoryIds = [];
        $leafCategoryId = null;

        if (! $options['dry_run']) {
            foreach ($categoryPaths as $path) {
                $resolved = $this->resolveCategoryPath($path);

                foreach ($resolved as $category) {
                    $categoryIds[] = $category->id;
                }

                $leafCategoryId = Arr::last($resolved)?->id ?? $leafCategoryId;
            }
        }

        $brandName = $this->inferBrandName($productName, $categoryPaths);
        $brand = ! $options['dry_run'] ? $this->resolveBrand($brandName) : null;

        $payload = [
            'brand_id' => $brand?->id,
            'primary_category_id' => $leafCategoryId,
            'name' => $this->localizedValue($productName),
            'slug' => $this->localizedSlug(
                $this->metaValue($row, 'Meta: _wp_desired_post_slug') ?: $productName
            ),
            'short_description' => $this->localizedValue($this->normalizeImportedText((string) ($row['Descriere scurtă'] ?? ''))),
            'description' => $this->localizedValue($this->normalizeImportedText((string) ($row['Descriere'] ?? ''))),
            'meta_title' => $this->localizedValue($productName),
            'meta_keywords' => $this->localizedValue((string) ($row['Meta: _yoast_wpseo_focuskw'] ?? '')),
            'meta_description' => $this->localizedValue($this->normalizeImportedText(
                (string) ($row['Meta: _yoast_wpseo_metadesc'] ?? ($row['Descriere scurtă'] ?? ''))
            )),
            'sku' => $sku,
            'price' => $this->salePrice($row),
            'compare_at_price' => $this->compareAtPrice($row),
            'stock_quantity' => $this->stockQuantity($row, (int) $options['default_stock']),
            'is_active' => $this->isActive($row),
            'is_featured' => $this->toBool($row['Este reprezentativ?'] ?? false),
            'sort_order' => (int) ($row['Poziție'] ?? 0),
        ];

        if ($options['dry_run']) {
            return $isUpdate ? 'updated' : 'imported';
        }

        $product = DB::transaction(function () use (
            $existingProduct,
            $payload,
            $categoryIds,
            $row,
            $filePath,
            $options,
            $productName
        ): Product {
            $product = $existingProduct ?? new Product();
            $product->fill($payload);
            $product->save();

            $categoryIds = array_values(array_unique(array_filter($categoryIds)));
            if ($categoryIds !== []) {
                $product->categories()->sync($categoryIds);
            } else {
                $product->categories()->sync([]);
            }

            $attributeRows = $this->attributeRows($row);
            $this->syncAttributes($product, $attributeRows, $categoryIds, $productName);

            if ($options['download_images']) {
                $this->syncImages($product, (string) ($row['Imagini'] ?? ''), $filePath, (bool) $options['refresh_images']);
            }

            $product->refresh();

            return $product;
        });

        $this->productCache[$product->sku] = $product;

        $this->progress($options, ($isUpdate ? 'Actualizat' : 'Importat')." produsul {$product->sku}");

        return $isUpdate ? 'updated' : 'imported';
    }

    /**
     * @return \Generator<int, array<string, string>>
     */
    private function rows(string $filePath): \Generator
    {
        $handle = fopen($filePath, 'rb');

        if (! is_resource($handle)) {
            throw new RuntimeException("Nu am putut deschide fișierul {$filePath}");
        }

        try {
            $headers = fgetcsv($handle);

            if (! is_array($headers)) {
                throw new RuntimeException('CSV-ul nu conține header.');
            }

            $headers = array_map(function ($header) {
                $header = (string) $header;

                return (string) preg_replace('/^\xEF\xBB\xBF/u', '', $header);
            }, $headers);

            $rowNumber = 1;
            while (($values = fgetcsv($handle)) !== false) {
                $rowNumber++;

                if ($values === [null] || $values === []) {
                    continue;
                }

                if (count($values) < count($headers)) {
                    $values = array_pad($values, count($headers), '');
                }

                yield $rowNumber => array_combine($headers, array_slice($values, 0, count($headers)));
            }
        } finally {
            fclose($handle);
        }
    }

    private function bootstrapCaches(): void
    {
        $this->brandCache = [];
        foreach (Brand::query()->get() as $brand) {
            $this->brandCache[$this->normalize($brand->getTranslation('name', 'ro'))] = $brand;
        }

        $this->categoryCache = [];
        foreach (Category::query()->get() as $category) {
            $this->categoryCache[$this->categoryCacheKey($category->parent_id, $category->getTranslation('name', 'ro'))] = $category;
        }

        $this->attributeCache = [];
        $this->attributeOptionCache = [];
        foreach (Attribute::query()->with(['options', 'categories'])->get() as $attribute) {
            $this->attributeCache[$this->normalize($attribute->getTranslation('name', 'ro'))] = $attribute;

            foreach ($attribute->options as $option) {
                $this->attributeOptionCache[$this->attributeOptionCacheKey($attribute->id, $option->getTranslation('value', 'ro'))] = $option;
            }
        }

        $this->productCache = Product::query()->get()->keyBy('sku')->all();
    }

    /**
     * @return list<list<string>>
     */
    private function parseCategoryPaths(string $value): array
    {
        $paths = [];

        foreach (array_filter(array_map('trim', explode(',', $value))) as $entry) {
            $segments = array_values(array_filter(array_map('trim', explode('>', $entry))));

            if ($segments !== []) {
                $paths[] = $segments;
            }
        }

        return $paths;
    }

    private function inferBrandName(string $productName, array $categoryPaths): ?string
    {
        foreach ($categoryPaths as $path) {
            if (count($path) < 2) {
                continue;
            }

            $leaf = trim((string) Arr::last($path));
            if ($leaf !== '') {
                return $leaf;
            }
        }

        $firstToken = trim((string) Str::of($productName)->before(' '));

        return $firstToken !== '' ? $firstToken : null;
    }

    /**
     * @return list<Category>
     */
    private function resolveCategoryPath(array $segments): array
    {
        $resolved = [];
        $parentId = null;

        foreach ($segments as $segment) {
            $key = $this->categoryCacheKey($parentId, $segment);
            $category = $this->categoryCache[$key] ?? null;

            if (! $category) {
                $category = Category::query()->create([
                    'parent_id' => $parentId,
                    'name' => $this->localizedValue($segment),
                    'slug' => $this->localizedSlug($this->categorySlug($segment)),
                    'description' => $this->localizedValue(''),
                    'is_active' => true,
                    'is_featured' => false,
                    'menu_order' => 0,
                ]);

                $this->categoryCache[$key] = $category;
            }

            $resolved[] = $category;
            $parentId = $category->id;
        }

        return $resolved;
    }

    private function resolveBrand(?string $brandName): ?Brand
    {
        $brandName = trim((string) $brandName);
        if ($brandName === '') {
            return null;
        }

        $key = $this->normalize($brandName);
        $brand = $this->brandCache[$key] ?? null;

        if ($brand) {
            return $brand;
        }

        $brand = Brand::query()->create([
            'name' => $this->localizedValue($brandName),
            'slug' => $this->localizedSlug($brandName),
            'description' => $this->localizedValue(''),
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $this->brandCache[$key] = $brand;

        return $brand;
    }

    /**
     * @param  list<array{name: string, values: list<string>, visible: bool}>  $attributeRows
     * @param  list<int>  $categoryIds
     */
    private function syncAttributes(Product $product, array $attributeRows, array $categoryIds, string $productName): void
    {
        $product->attributeValues()->delete();

        foreach ($attributeRows as $index => $attributeRow) {
            $attribute = $this->resolveAttribute($attributeRow['name'], $attributeRow['values'], $attributeRow['visible']);
            $attribute->categories()->syncWithoutDetaching($categoryIds);

            if ($attribute->type === 'number') {
                $number = $this->extractNumber($attributeRow['values'][0] ?? null);

                if ($number === null) {
                    continue;
                }

                ProductAttributeValue::query()->create([
                    'product_id' => $product->id,
                    'attribute_id' => $attribute->id,
                    'number_value' => $number,
                    'sort_order' => $index,
                ]);

                continue;
            }

            if ($attribute->type === 'boolean') {
                ProductAttributeValue::query()->create([
                    'product_id' => $product->id,
                    'attribute_id' => $attribute->id,
                    'boolean_value' => $this->toBool($attributeRow['values'][0] ?? false),
                    'sort_order' => $index,
                ]);

                continue;
            }

            foreach ($attributeRow['values'] as $value) {
                $option = $this->resolveAttributeOption($attribute, $value);

                ProductAttributeValue::query()->create([
                    'product_id' => $product->id,
                    'attribute_id' => $attribute->id,
                    'attribute_option_id' => $option->id,
                    'sort_order' => $index,
                ]);
            }
        }

        if ($attributeRows === [] && Str::contains(Str::lower($productName), 'runflat')) {
            $attribute = $this->resolveAttribute('Runflat', ['Da'], true);
            $option = $this->resolveAttributeOption($attribute, 'Da');

            ProductAttributeValue::query()->create([
                'product_id' => $product->id,
                'attribute_id' => $attribute->id,
                'attribute_option_id' => $option->id,
                'sort_order' => 999,
            ]);
        }
    }

    private function resolveAttribute(string $name, array $values, bool $visible): Attribute
    {
        $key = $this->normalize($name);
        $attribute = $this->attributeCache[$key] ?? null;
        $type = $this->attributeType($name, $values);

        if (! $attribute) {
            $slugs = $this->attributeSlugs($name);

            $attribute = Attribute::query()->create([
                'name' => $this->attributeNames($name),
                'slug' => $slugs,
                'description' => $this->localizedValue(''),
                'type' => $type,
                'is_filterable' => $visible,
                'is_required' => false,
                'is_active' => true,
                'sort_order' => 0,
            ]);

            $this->attributeCache[$key] = $attribute;

            return $attribute;
        }

        $dirty = false;

        if ($attribute->type !== $type) {
            $attribute->type = $type;
            $dirty = true;
        }

        if ($visible && ! $attribute->is_filterable) {
            $attribute->is_filterable = true;
            $dirty = true;
        }

        if ($dirty) {
            $attribute->save();
        }

        return $attribute;
    }

    private function resolveAttributeOption(Attribute $attribute, string $value): AttributeOption
    {
        $key = $this->attributeOptionCacheKey($attribute->id, $value);
        $option = $this->attributeOptionCache[$key] ?? null;

        if ($option) {
            return $option;
        }

        $option = AttributeOption::query()->create([
            'attribute_id' => $attribute->id,
            'value' => $this->localizedValue($value),
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $this->attributeOptionCache[$key] = $option;

        return $option;
    }

    private function syncImages(Product $product, string $imagesValue, string $filePath, bool $refreshImages): void
    {
        $existingPaths = $product->images()->pluck('path')->all();
        if ($existingPaths !== [] && ! $refreshImages) {
            return;
        }

        $sources = $this->parseImageSources($imagesValue);
        if ($sources === []) {
            return;
        }

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $product->images()->delete();

        $storedPaths = [];
        foreach ($sources as $index => $source) {
            $storedPath = $this->downloadImage($source, $filePath, $product->sku, $index);

            if (! $storedPath) {
                continue;
            }

            $storedPaths[] = $storedPath;

            ProductImage::query()->create([
                'product_id' => $product->id,
                'path' => $storedPath,
                'sort_order' => $index,
            ]);
        }

        $product->update([
            'image_path' => $storedPaths[0] ?? null,
        ]);
    }

    /**
     * @return list<array{name: string, values: list<string>, visible: bool}>
     */
    private function attributeRows(array $row): array
    {
        $result = [];

        for ($index = 1; $index <= 20; $index++) {
            $name = trim((string) ($row["Nume atribut {$index}"] ?? ''));
            if ($name === '' || Str::lower($name) === 'none') {
                continue;
            }

            $values = $this->parseAttributeValues((string) ($row["Valoare (valori) atribut {$index}"] ?? ''));
            if ($values === []) {
                continue;
            }

            $result[] = [
                'name' => $name,
                'values' => $values,
                'visible' => $this->toBool($row["Vizibilitate atribut {$index}"] ?? false),
            ];
        }

        return $result;
    }

    /**
     * @return list<string>
     */
    private function parseAttributeValues(string $value): array
    {
        $value = trim($value);

        if ($value === '') {
            return [];
        }

        $separator = str_contains($value, '|') ? '|' : null;
        $parts = $separator ? explode($separator, $value) : [$value];

        return array_values(array_filter(array_map(
            fn (string $item) => trim($item),
            $parts
        )));
    }

    /**
     * @return list<string>
     */
    private function parseImageSources(string $value): array
    {
        return array_values(array_filter(array_map(
            fn (string $item) => trim($item),
            explode(',', $value)
        )));
    }

    private function downloadImage(string $source, string $csvPath, string $sku, int $index): ?string
    {
        if ($source === '') {
            return null;
        }

        $contents = null;
        $extension = null;

        if (filter_var($source, FILTER_VALIDATE_URL)) {
            try {
                $response = Http::timeout(60)->retry(2, 500)->get($source);
            } catch (ConnectionException $exception) {
                throw new RuntimeException("Nu am putut descărca imaginea {$source}: {$exception->getMessage()}");
            }

            if (! $response->successful()) {
                throw new RuntimeException("Nu am putut descărca imaginea {$source}: HTTP {$response->status()}");
            }

            $contents = $response->body();
            $extension = pathinfo(parse_url($source, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION)
                ?: $this->extensionFromMimeType($response->header('Content-Type'));
        } else {
            $resolvedPath = $this->resolveLocalImagePath($source, $csvPath);

            if (! $resolvedPath || ! is_file($resolvedPath)) {
                throw new RuntimeException("Imagine locală lipsă: {$source}");
            }

            $contents = file_get_contents($resolvedPath) ?: null;
            $extension = pathinfo($resolvedPath, PATHINFO_EXTENSION);
        }

        if (! $contents) {
            return null;
        }

        $extension = $extension ?: 'jpg';
        $path = 'products/imports/'.Str::slug($sku).'-'.($index + 1).'-'.Str::random(8).'.'.$extension;
        Storage::disk('public')->put($path, $contents);

        return $path;
    }

    private function resolveLocalImagePath(string $source, string $csvPath): ?string
    {
        if (is_file($source)) {
            return $source;
        }

        $candidate = dirname($csvPath).DIRECTORY_SEPARATOR.ltrim($source, DIRECTORY_SEPARATOR);

        return is_file($candidate) ? $candidate : null;
    }

    private function extensionFromMimeType(?string $contentType): string
    {
        return match (Str::before((string) $contentType, ';')) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => 'jpg',
        };
    }

    private function salePrice(array $row): float
    {
        $sale = $this->decimalOrNull($row['Preț de vânzare'] ?? null);
        $regular = $this->decimalOrNull($row['Preț obișnuit'] ?? null);

        return $sale ?? $regular ?? 0.0;
    }

    private function compareAtPrice(array $row): ?float
    {
        $sale = $this->decimalOrNull($row['Preț de vânzare'] ?? null);
        $regular = $this->decimalOrNull($row['Preț obișnuit'] ?? null);

        if ($sale !== null && $regular !== null && $regular > $sale) {
            return $regular;
        }

        return null;
    }

    private function stockQuantity(array $row, int $defaultStock): int
    {
        $stock = trim((string) ($row['Stoc'] ?? ''));

        if ($stock !== '' && is_numeric($stock)) {
            return max(0, (int) $stock);
        }

        $status = Str::lower(trim((string) ($row['În stoc?'] ?? '0')));

        return in_array($status, ['1', 'true', 'yes', 'backorder'], true) ? max(1, $defaultStock) : 0;
    }

    private function isActive(array $row): bool
    {
        $isPublished = $this->toBool($row['Publicat'] ?? false);
        $visibility = Str::lower(trim((string) ($row['Vizibilitate în catalog'] ?? 'visible')));

        return $isPublished && $visibility !== 'hidden';
    }

    private function decimalOrNull(mixed $value): ?float
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        $value = str_replace([' ', ','], ['', '.'], $value);

        return is_numeric($value) ? (float) $value : null;
    }

    private function extractNumber(mixed $value): ?float
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        if (preg_match('/-?\d+(?:[.,]\d+)?/', $value, $matches) !== 1) {
            return null;
        }

        return (float) str_replace(',', '.', $matches[0]);
    }

    private function metaValue(array $row, string $key): ?string
    {
        $value = trim((string) ($row[$key] ?? ''));

        return $value !== '' ? $value : null;
    }

    private function toBool(mixed $value): bool
    {
        $normalized = Str::lower(trim((string) $value));

        return in_array($normalized, ['1', 'true', 'yes', 'da', 'backorder'], true);
    }

    private function localizedValue(?string $value, ?string $ruValue = null): array
    {
        $value = trim((string) $value);
        $ruValue = trim((string) ($ruValue ?? $value));

        return [
            'ro' => $value,
            'ru' => $ruValue,
        ];
    }

    private function normalizeImportedText(?string $value): string
    {
        return trim(str_replace(
            ["\\r\\n", "\\n", "\\r", "\r\n", "\r"],
            "\n",
            (string) $value
        ));
    }

    private function localizedSlug(string $value, ?string $ruValue = null): array
    {
        $value = trim($value);
        $ruValue = trim($ruValue ?? $value);

        return [
            'ro' => Str::slug($value),
            'ru' => Str::slug($ruValue),
        ];
    }

    private function attributeNames(string $sourceName): array
    {
        return match ($this->normalize($sourceName)) {
            'diametru' => ['ro' => 'Diametru', 'ru' => 'Диаметр'],
            'latime-mm', 'latime' => ['ro' => 'Lățime', 'ru' => 'Ширина'],
            'inaltime', 'inaltime-%' => ['ro' => 'Înălțime', 'ru' => 'Высота'],
            'season' => ['ro' => 'Sezon', 'ru' => 'Сезон'],
            default => $this->localizedValue($sourceName),
        };
    }

    private function attributeSlugs(string $sourceName): array
    {
        return match ($this->normalize($sourceName)) {
            'diametru' => ['ro' => 'diametru', 'ru' => 'diametr'],
            'latime-mm', 'latime' => ['ro' => 'latime', 'ru' => 'shirina'],
            'inaltime', 'inaltime-%' => ['ro' => 'inaltime', 'ru' => 'vysota'],
            'season' => ['ro' => 'sezon', 'ru' => 'sezon'],
            default => $this->localizedSlug($sourceName),
        };
    }

    /**
     * @param  list<string>  $values
     */
    private function attributeType(string $name, array $values): string
    {
        $normalized = $this->normalize($name);

        if (in_array($normalized, ['latime-mm', 'latime', 'inaltime', 'inaltime-%'], true)) {
            return 'number';
        }

        if ($normalized === 'diametru' || $normalized === 'season') {
            return count($values) > 1 ? 'multi_select' : 'select';
        }

        if (count($values) > 1) {
            return 'multi_select';
        }

        $value = $values[0] ?? '';
        $booleanValues = ['0', '1', 'true', 'false', 'yes', 'no', 'da', 'nu'];
        if (in_array(Str::lower($value), $booleanValues, true)) {
            return 'boolean';
        }

        return $this->extractNumber($value) !== null && ! preg_match('/[[:alpha:]]/u', $value)
            ? 'number'
            : 'select';
    }

    private function categorySlug(string $value): string
    {
        return Str::of($value)->replace('%', '')->trim()->value();
    }

    private function categoryCacheKey(?int $parentId, string $name): string
    {
        return ($parentId ?? 0).'|'.$this->normalize($name);
    }

    private function attributeOptionCacheKey(int $attributeId, string $value): string
    {
        return $attributeId.'|'.$this->normalize($value);
    }

    private function normalize(?string $value): string
    {
        $value = Str::of((string) $value)
            ->ascii()
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/u', '-')
            ->trim('-')
            ->value();

        return $value;
    }

    /**
     * @param  array{progress?: callable(string): void}  $options
     */
    private function progress(array $options, string $message): void
    {
        if (is_callable($options['progress'] ?? null)) {
            $options['progress']($message);
        }
    }
}
