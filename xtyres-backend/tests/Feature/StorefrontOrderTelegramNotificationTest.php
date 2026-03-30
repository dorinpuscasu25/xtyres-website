<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StorefrontOrderTelegramNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_orders_are_sent_to_telegram(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response(['ok' => true], 200),
        ]);

        $product = $this->createProduct();

        $response = $this->postJson('/api/storefront/orders?locale=ro', [
            'customer' => [
                'first_name' => 'Ion',
                'last_name' => 'Popescu',
                'email' => 'ion@example.com',
                'phone' => '+37360000000',
                'city' => 'Chișinău',
                'street' => 'Ștefan cel Mare',
                'street_number' => '10A',
                'postal_code' => 'MD-2001',
            ],
            'payment_method' => 'cash',
            'note' => 'Sunați înainte de livrare',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertCreated();

        Http::assertSent(function (Request $request) {
            $data = $request->data();

            return $request->url() === 'https://api.telegram.org/bot2018095725:AAGoJbONadK3LnkpA3_2UB0Y_RygRERQFGQ/sendMessage'
                && ($data['chat_id'] ?? null) === '-583530233'
                && str_contains((string) ($data['text'] ?? ''), 'Comanda noua')
                && str_contains((string) ($data['text'] ?? ''), 'Ion Popescu')
                && str_contains((string) ($data['text'] ?? ''), 'TEST-ORDER-001');
        });
    }

    public function test_order_is_still_created_when_telegram_returns_an_error(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response(['ok' => false], 500),
        ]);

        $product = $this->createProduct();

        $response = $this->postJson('/api/storefront/orders?locale=ro', [
            'customer' => [
                'first_name' => 'Ana',
                'last_name' => 'Ionescu',
                'email' => 'ana@example.com',
                'phone' => '+37361111111',
                'city' => 'Bălți',
                'street' => 'Independenței',
                'street_number' => '5',
            ],
            'payment_method' => 'card',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response->assertCreated();

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', [
            'customer_first_name' => 'Ana',
            'customer_last_name' => 'Ionescu',
        ]);
    }

    private function createProduct(): Product
    {
        return Product::create([
            'name' => [
                'ro' => 'Baterie Test 70Ah',
                'ru' => 'Тестовый аккумулятор 70Ah',
            ],
            'slug' => [
                'ro' => 'baterie-test-70ah',
                'ru' => 'test-batareya-70ah',
            ],
            'short_description' => [
                'ro' => 'Produs pentru test.',
                'ru' => 'Товар для теста.',
            ],
            'description' => [
                'ro' => 'Descriere test.',
                'ru' => 'Тестовое описание.',
            ],
            'sku' => 'TEST-ORDER-001',
            'price' => 1500,
            'stock_quantity' => 10,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);
    }
}
