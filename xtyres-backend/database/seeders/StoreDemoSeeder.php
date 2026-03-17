<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

class StoreDemoSeeder extends Seeder
{
    public function run(): void
    {
        $michelin = Brand::query()->updateOrCreate(
            ['website_url' => 'https://www.michelin.com'],
            [
                'name' => ['ro' => 'Michelin', 'ru' => 'Michelin'],
                'slug' => ['ro' => 'michelin', 'ru' => 'michelin'],
                'description' => [
                    'ro' => 'Brand premium de anvelope.',
                    'ru' => 'Премиальный бренд шин.',
                ],
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        $continental = Brand::query()->updateOrCreate(
            ['website_url' => 'https://www.continental.com'],
            [
                'name' => ['ro' => 'Continental', 'ru' => 'Continental'],
                'slug' => ['ro' => 'continental', 'ru' => 'continental'],
                'description' => [
                    'ro' => 'Anvelope pentru toate sezoanele.',
                    'ru' => 'Шины для всех сезонов.',
                ],
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        $varta = Brand::query()->updateOrCreate(
            ['website_url' => 'https://www.varta.com'],
            [
                'name' => ['ro' => 'Varta', 'ru' => 'Varta'],
                'slug' => ['ro' => 'varta', 'ru' => 'varta'],
                'description' => [
                    'ro' => 'Acumulatoare auto de încredere.',
                    'ru' => 'Надежные автомобильные аккумуляторы.',
                ],
                'sort_order' => 3,
                'is_active' => true,
            ]
        );

        $tires = Category::query()->updateOrCreate(
            ['slug->ro' => 'anvelope'],
            [
                'name' => ['ro' => 'Anvelope', 'ru' => 'Шины'],
                'slug' => ['ro' => 'anvelope', 'ru' => 'shiny'],
                'description' => [
                    'ro' => 'Anvelope pentru orice sezon.',
                    'ru' => 'Шины для любого сезона.',
                ],
                'is_active' => true,
                'is_featured' => true,
                'menu_order' => 1,
            ]
        );

        $summer = Category::query()->updateOrCreate(
            ['slug->ro' => 'anvelope-vara'],
            [
                'parent_id' => $tires->id,
                'name' => ['ro' => 'Anvelope de vara', 'ru' => 'Летние шины'],
                'slug' => ['ro' => 'anvelope-vara', 'ru' => 'letnie-shiny'],
                'description' => [
                    'ro' => 'Modele pentru sezonul cald.',
                    'ru' => 'Модели для теплого сезона.',
                ],
                'is_active' => true,
                'is_featured' => true,
                'menu_order' => 1,
            ]
        );

        $winter = Category::query()->updateOrCreate(
            ['slug->ro' => 'anvelope-iarna'],
            [
                'parent_id' => $tires->id,
                'name' => ['ro' => 'Anvelope de iarna', 'ru' => 'Зимние шины'],
                'slug' => ['ro' => 'anvelope-iarna', 'ru' => 'zimnie-shiny'],
                'description' => [
                    'ro' => 'Aderență și siguranță pe timp rece.',
                    'ru' => 'Сцепление и безопасность в холодное время.',
                ],
                'is_active' => true,
                'is_featured' => true,
                'menu_order' => 2,
            ]
        );

        $batteries = Category::query()->updateOrCreate(
            ['slug->ro' => 'acumulatoare'],
            [
                'name' => ['ro' => 'Acumulatoare', 'ru' => 'Аккумуляторы'],
                'slug' => ['ro' => 'acumulatoare', 'ru' => 'akkumulyatory'],
                'description' => [
                    'ro' => 'Acumulatoare auto pentru pornire sigură.',
                    'ru' => 'Автомобильные аккумуляторы для уверенного старта.',
                ],
                'is_active' => true,
                'is_featured' => true,
                'menu_order' => 2,
            ]
        );

        $season = Attribute::query()->updateOrCreate(
            ['slug->ro' => 'sezon'],
            [
                'name' => ['ro' => 'Sezon', 'ru' => 'Сезон'],
                'slug' => ['ro' => 'sezon', 'ru' => 'sezon'],
                'type' => 'select',
                'is_filterable' => true,
                'is_required' => true,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $width = Attribute::query()->updateOrCreate(
            ['slug->ro' => 'latime'],
            [
                'name' => ['ro' => 'Latime', 'ru' => 'Ширина'],
                'slug' => ['ro' => 'latime', 'ru' => 'shirina'],
                'type' => 'number',
                'is_filterable' => true,
                'is_required' => false,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $diameter = Attribute::query()->updateOrCreate(
            ['slug->ro' => 'diametru'],
            [
                'name' => ['ro' => 'Diametru', 'ru' => 'Диаметр'],
                'slug' => ['ro' => 'diametru', 'ru' => 'diametr'],
                'type' => 'select',
                'is_filterable' => true,
                'is_required' => false,
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        $height = Attribute::query()->updateOrCreate(
            ['slug->ro' => 'inaltime'],
            [
                'name' => ['ro' => 'Inaltime', 'ru' => 'Высота'],
                'slug' => ['ro' => 'inaltime', 'ru' => 'vysota'],
                'type' => 'number',
                'is_filterable' => true,
                'is_required' => false,
                'is_active' => true,
                'sort_order' => 4,
            ]
        );

        $capacity = Attribute::query()->updateOrCreate(
            ['slug->ro' => 'capacitate'],
            [
                'name' => ['ro' => 'Capacitate', 'ru' => 'Емкость'],
                'slug' => ['ro' => 'capacitate', 'ru' => 'emkost'],
                'type' => 'number',
                'is_filterable' => true,
                'is_required' => false,
                'is_active' => true,
                'sort_order' => 5,
            ]
        );

        $season->categories()->syncWithoutDetaching([$summer->id, $winter->id, $tires->id]);
        $width->categories()->syncWithoutDetaching([$summer->id, $winter->id, $tires->id]);
        $diameter->categories()->syncWithoutDetaching([$summer->id, $winter->id, $tires->id]);
        $height->categories()->syncWithoutDetaching([$summer->id, $winter->id, $tires->id]);
        $capacity->categories()->syncWithoutDetaching([$batteries->id]);

        $summerOption = AttributeOption::query()->updateOrCreate(
            ['attribute_id' => $season->id, 'value->ro' => 'Vara'],
            [
                'value' => ['ro' => 'Vara', 'ru' => 'Лето'],
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        $winterOption = AttributeOption::query()->updateOrCreate(
            ['attribute_id' => $season->id, 'value->ro' => 'Iarna'],
            [
                'value' => ['ro' => 'Iarna', 'ru' => 'Зима'],
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        $r16Option = AttributeOption::query()->updateOrCreate(
            ['attribute_id' => $diameter->id, 'value->ro' => 'R16'],
            [
                'value' => ['ro' => 'R16', 'ru' => 'R16'],
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        $r17Option = AttributeOption::query()->updateOrCreate(
            ['attribute_id' => $diameter->id, 'value->ro' => 'R17'],
            [
                'value' => ['ro' => 'R17', 'ru' => 'R17'],
                'sort_order' => 2,
                'is_active' => true,
            ]
        );

        $product1 = Product::query()->updateOrCreate(
            ['sku' => 'XTY-0001'],
            [
                'brand_id' => $michelin->id,
                'primary_category_id' => $summer->id,
                'name' => [
                    'ro' => '205/55 R16 Michelin Primacy 4+',
                    'ru' => '205/55 R16 Michelin Primacy 4+',
                ],
                'slug' => [
                    'ro' => '205-55-r16-michelin-primacy-4-plus',
                    'ru' => '205-55-r16-michelin-primacy-4-plus',
                ],
                'short_description' => [
                    'ro' => 'Anvelopă premium de vară pentru autoturisme.',
                    'ru' => 'Премиальная летняя шина для легковых автомобилей.',
                ],
                'description' => [
                    'ro' => 'Model stabil, silențios și eficient pentru drumuri urbane și extraurbane.',
                    'ru' => 'Стабильная, тихая и эффективная модель для города и трассы.',
                ],
                'price' => 1850,
                'compare_at_price' => 1990,
                'stock_quantity' => 24,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 1,
            ]
        );
        $product1->categories()->sync([$summer->id, $tires->id]);

        $product2 = Product::query()->updateOrCreate(
            ['sku' => 'XTY-0002'],
            [
                'brand_id' => $continental->id,
                'primary_category_id' => $winter->id,
                'name' => [
                    'ro' => '225/65 R17 Continental WinterContact',
                    'ru' => '225/65 R17 Continental WinterContact',
                ],
                'slug' => [
                    'ro' => '225-65-r17-continental-wintercontact',
                    'ru' => '225-65-r17-continental-wintercontact',
                ],
                'short_description' => [
                    'ro' => 'Anvelopă de iarnă cu tracțiune excelentă.',
                    'ru' => 'Зимняя шина с отличным сцеплением.',
                ],
                'description' => [
                    'ro' => 'Ideală pentru temperaturi joase și carosabil dificil.',
                    'ru' => 'Идеальна для низких температур и сложного покрытия.',
                ],
                'price' => 4275,
                'compare_at_price' => 4495,
                'stock_quantity' => 12,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ]
        );
        $product2->categories()->sync([$winter->id, $tires->id]);

        $product3 = Product::query()->updateOrCreate(
            ['sku' => 'XTY-0003'],
            [
                'brand_id' => $varta->id,
                'primary_category_id' => $batteries->id,
                'name' => [
                    'ro' => 'Acumulator Varta Blue Dynamic 74Ah',
                    'ru' => 'Аккумулятор Varta Blue Dynamic 74Ah',
                ],
                'slug' => [
                    'ro' => 'acumulator-varta-blue-dynamic-74ah',
                    'ru' => 'akkumulyator-varta-blue-dynamic-74ah',
                ],
                'short_description' => [
                    'ro' => 'Acumulator auto pentru pornire sigură.',
                    'ru' => 'Автомобильный аккумулятор для уверенного старта.',
                ],
                'description' => [
                    'ro' => 'Potrivit pentru autoturisme și utilizare zilnică.',
                    'ru' => 'Подходит для легковых авто и ежедневного использования.',
                ],
                'price' => 2450,
                'compare_at_price' => null,
                'stock_quantity' => 18,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ]
        );
        $product3->categories()->sync([$batteries->id]);

        ProductAttributeValue::query()->whereIn('product_id', [$product1->id, $product2->id, $product3->id])->delete();

        ProductAttributeValue::query()->create([
            'product_id' => $product1->id,
            'attribute_id' => $season->id,
            'attribute_option_id' => $summerOption->id,
            'sort_order' => 1,
        ]);
        ProductAttributeValue::query()->create([
            'product_id' => $product1->id,
            'attribute_id' => $width->id,
            'number_value' => 205,
            'sort_order' => 2,
        ]);
        ProductAttributeValue::query()->create([
            'product_id' => $product1->id,
            'attribute_id' => $diameter->id,
            'attribute_option_id' => $r16Option->id,
            'sort_order' => 3,
        ]);
        ProductAttributeValue::query()->create([
            'product_id' => $product1->id,
            'attribute_id' => $height->id,
            'number_value' => 55,
            'sort_order' => 4,
        ]);

        ProductAttributeValue::query()->create([
            'product_id' => $product2->id,
            'attribute_id' => $season->id,
            'attribute_option_id' => $winterOption->id,
            'sort_order' => 1,
        ]);
        ProductAttributeValue::query()->create([
            'product_id' => $product2->id,
            'attribute_id' => $width->id,
            'number_value' => 225,
            'sort_order' => 2,
        ]);
        ProductAttributeValue::query()->create([
            'product_id' => $product2->id,
            'attribute_id' => $diameter->id,
            'attribute_option_id' => $r17Option->id,
            'sort_order' => 3,
        ]);
        ProductAttributeValue::query()->create([
            'product_id' => $product2->id,
            'attribute_id' => $height->id,
            'number_value' => 65,
            'sort_order' => 4,
        ]);

        ProductAttributeValue::query()->create([
            'product_id' => $product3->id,
            'attribute_id' => $capacity->id,
            'number_value' => 74,
            'sort_order' => 1,
        ]);

        $settings = StoreSetting::current();
        $settings->update([
            'site_name' => ['ro' => 'XTyres', 'ru' => 'XTyres'],
            'site_description' => [
                'ro' => 'Magazin online pentru anvelope, acumulatoare și accesorii auto.',
                'ru' => 'Интернет-магазин шин, аккумуляторов и автоаксессуаров.',
            ],
            'footer_text' => [
                'ro' => 'Partenerul tău de încredere pentru produse auto.',
                'ru' => 'Ваш надежный партнер в авто товарах.',
            ],
            'contact_address' => [
                'ro' => 'mun. Chișinău, str. Vadul lui Vodă 21/1',
                'ru' => 'г. Кишинев, ул. Вадул луй Водэ 21/1',
            ],
            'working_hours' => [
                'ro' => 'Luni - Sâmbătă, 8:30 - 18:30',
                'ru' => 'Понедельник - Суббота, 8:30 - 18:30',
            ],
            'emails' => ['info@xtyres.md'],
            'phones' => ['+373 61 11 66 65'],
            'social_links' => [
                ['name' => 'facebook', 'url' => 'https://facebook.com/xtyres'],
                ['name' => 'instagram', 'url' => 'https://instagram.com/xtyres'],
            ],
        ]);

        $demoOrder = Order::query()->updateOrCreate(
            ['order_number' => 'XT-DEMO-00001'],
            [
                'status' => 'new',
                'locale' => 'ro',
                'customer_first_name' => 'Ion',
                'customer_last_name' => 'Popescu',
                'customer_email' => 'ion.popescu@example.com',
                'customer_phone' => '+37369111222',
                'city' => 'Chișinău',
                'street' => 'Strada Industrială',
                'street_number' => '12A',
                'postal_code' => 'MD-2001',
                'payment_method' => 'cash',
                'currency' => 'MDL',
                'subtotal' => 1850,
                'total' => 1850,
                'note' => 'Vă rog să mă sunați înainte de livrare.',
            ]
        );

        $demoOrder->items()->delete();
        OrderItem::query()->create([
            'order_id' => $demoOrder->id,
            'product_id' => $product1->id,
            'product_name' => $product1->getTranslations('name'),
            'sku' => $product1->sku,
            'quantity' => 1,
            'unit_price' => 1850,
            'total_price' => 1850,
            'attributes_snapshot' => [
                ['label' => 'Sezon', 'value' => 'Vara'],
                ['label' => 'Latime', 'value' => '205'],
                ['label' => 'Diametru', 'value' => 'R16'],
                ['label' => 'Inaltime', 'value' => '55'],
            ],
        ]);
    }
}
