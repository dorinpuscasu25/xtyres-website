<?php

namespace Tests\Feature\Console;

use App\Models\Attribute;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WooCommerceImportCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_imports_products_categories_attributes_and_images_from_woocommerce_csv(): void
    {
        Storage::fake('public');

        Http::fake([
            'https://example.com/*' => Http::response('fake-image-content', 200, [
                'Content-Type' => 'image/jpeg',
            ]),
        ]);

        $csvPath = $this->makeCsv([
            [
                'ID' => '1',
                'Tip' => 'simple',
                'SKU' => 'SKU-1',
                'Nume' => 'CONTINENTAL PremiumContact 205/55 R16',
                'Publicat' => '1',
                'Este reprezentativ?' => '1',
                'Vizibilitate în catalog' => 'visible',
                'Descriere scurtă' => 'Scurtă descriere',
                'Descriere' => 'Descriere completă',
                'În stoc?' => '1',
                'Stoc' => '',
                'Preț de vânzare' => '1899',
                'Preț obișnuit' => '1999',
                'Categorii' => 'Anvelope, Anvelope > CONTINENTAL',
                'Imagini' => 'https://example.com/1.jpg, https://example.com/2.jpg',
                'Poziție' => '3',
                'Nume atribut 1' => 'Diametru',
                'Valoare (valori) atribut 1' => 'R16',
                'Vizibilitate atribut 1' => '1',
                'Nume atribut 2' => 'lăţime, mm',
                'Valoare (valori) atribut 2' => '205',
                'Vizibilitate atribut 2' => '1',
                'Nume atribut 3' => 'Inaltime, %',
                'Valoare (valori) atribut 3' => '55',
                'Vizibilitate atribut 3' => '1',
                'Nume atribut 4' => 'season',
                'Valoare (valori) atribut 4' => 'Vara',
                'Vizibilitate atribut 4' => '1',
                'Meta: _yoast_wpseo_focuskw' => 'anvelope vara',
                'Meta: _yoast_wpseo_metadesc' => 'Meta descriere importată',
                'Meta: _wp_desired_post_slug' => 'continental-premiumcontact-205-55-r16',
            ],
        ]);

        $this->artisan('catalog:import-woocommerce', [
            'file' => $csvPath,
        ])->assertExitCode(0);

        $product = Product::query()->where('sku', 'SKU-1')->firstOrFail();

        $this->assertSame('CONTINENTAL PremiumContact 205/55 R16', $product->getTranslation('name', 'ro'));
        $this->assertSame(100, $product->stock_quantity);
        $this->assertSame('anvelope vara', $product->getTranslation('meta_keywords', 'ro'));
        $this->assertSame('Meta descriere importată', $product->getTranslation('meta_description', 'ro'));
        $this->assertTrue($product->is_featured);

        $this->assertDatabaseCount('brands', 1);
        $this->assertSame('CONTINENTAL', Brand::query()->firstOrFail()->getTranslation('name', 'ro'));

        $this->assertDatabaseCount('categories', 2);
        $this->assertSame(
            ['Anvelope', 'CONTINENTAL'],
            Category::query()->orderBy('id')->get()->map->getTranslation('name', 'ro')->all()
        );

        $this->assertDatabaseCount('product_images', 2);
        Storage::disk('public')->assertExists(ProductImage::query()->firstOrFail()->path);

        $attributes = Attribute::query()->get()->keyBy(
            fn (Attribute $attribute) => $attribute->getTranslation('slug', 'ro')
        );

        $diameter = $attributes->get('diametru');
        $width = $attributes->get('latime');
        $height = $attributes->get('inaltime');
        $season = $attributes->get('sezon');

        $this->assertNotNull($diameter);
        $this->assertNotNull($width);
        $this->assertNotNull($height);
        $this->assertNotNull($season);
        $this->assertSame('select', $diameter->type);
        $this->assertSame('number', $width->type);
        $this->assertSame('number', $height->type);
        $this->assertSame('select', $season->type);

        $this->assertCount(4, $product->attributeValues);
        $this->assertNotNull($product->image_path);
    }

    public function test_it_supports_dry_run_without_writing_to_database(): void
    {
        $csvPath = $this->makeCsv([
            [
                'ID' => '1',
                'Tip' => 'simple',
                'SKU' => 'SKU-DRY',
                'Nume' => 'Energizer 80Ah',
                'Publicat' => '1',
                'Vizibilitate în catalog' => 'visible',
                'În stoc?' => '1',
                'Preț de vânzare' => '1000',
                'Preț obișnuit' => '1200',
                'Categorii' => 'Acumulatoare, Acumulatoare > Energizer',
            ],
        ]);

        $this->artisan('catalog:import-woocommerce', [
            'file' => $csvPath,
            '--dry-run' => true,
        ])->assertExitCode(0);

        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseCount('brands', 0);
        $this->assertDatabaseCount('categories', 0);
    }

    /**
     * @param  list<array<string, string>>  $rows
     */
    private function makeCsv(array $rows): string
    {
        $headers = [
            'ID',
            'Tip',
            'SKU',
            'Nume',
            'Publicat',
            'Este reprezentativ?',
            'Vizibilitate în catalog',
            'Descriere scurtă',
            'Descriere',
            'În stoc?',
            'Stoc',
            'Preț de vânzare',
            'Preț obișnuit',
            'Categorii',
            'Imagini',
            'Poziție',
            'Nume atribut 1',
            'Valoare (valori) atribut 1',
            'Vizibilitate atribut 1',
            'Nume atribut 2',
            'Valoare (valori) atribut 2',
            'Vizibilitate atribut 2',
            'Nume atribut 3',
            'Valoare (valori) atribut 3',
            'Vizibilitate atribut 3',
            'Nume atribut 4',
            'Valoare (valori) atribut 4',
            'Vizibilitate atribut 4',
            'Meta: _yoast_wpseo_focuskw',
            'Meta: _yoast_wpseo_metadesc',
            'Meta: _wp_desired_post_slug',
        ];

        $path = tempnam(sys_get_temp_dir(), 'wc-import-');
        $handle = fopen($path, 'wb');

        fputcsv($handle, $headers);

        foreach ($rows as $row) {
            fputcsv($handle, array_map(
                fn (string $header) => $row[$header] ?? '',
                $headers
            ));
        }

        fclose($handle);

        return $path;
    }
}
