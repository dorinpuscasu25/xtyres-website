<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Support\TelegramOrderNotifier;
use GuzzleHttp\Promise\PromiseInterface;
use GuzzleHttp\Psr7\Response;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Psr\Http\Message\ResponseInterface;
use Telegram\Bot\HttpClients\HttpClientInterface;
use Tests\TestCase;

class StorefrontOrderTelegramNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_orders_are_sent_to_telegram(): void
    {
        $httpClient = new RecordingTelegramHttpClient([
            [
                'status' => 200,
                'body' => [
                    'ok' => true,
                    'result' => [
                        'message_id' => 987,
                    ],
                ],
            ],
        ]);

        $this->app->instance(
            TelegramOrderNotifier::class,
            new class($httpClient) extends TelegramOrderNotifier
            {
                public function __construct(
                    private readonly HttpClientInterface $httpClient,
                ) {}

                protected function resolveHttpClientHandler(): ?HttpClientInterface
                {
                    return $this->httpClient;
                }
            }
        );

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

        $this->assertCount(1, $httpClient->requests);

        $request = $httpClient->requests[0];
        $data = $request['options']['form_params'] ?? [];

        $this->assertSame(
            'https://api.telegram.org/bot2018095725:AAGoJbONadK3LnkpA3_2UB0Y_RygRERQFGQ/sendMessage',
            $request['url']
        );
        $this->assertSame('POST', $request['method']);
        $this->assertSame('-583530233', $data['chat_id'] ?? null);
        $this->assertSame('HTML', $data['parse_mode'] ?? null);
        $this->assertTrue($data['disable_web_page_preview'] ?? false);
        $this->assertStringContainsString('Comanda noua', (string) ($data['text'] ?? ''));
        $this->assertStringContainsString('Ion Popescu', (string) ($data['text'] ?? ''));
        $this->assertStringContainsString('TEST-ORDER-001', (string) ($data['text'] ?? ''));
    }

    public function test_order_is_still_created_when_telegram_returns_an_error(): void
    {
        $httpClient = new RecordingTelegramHttpClient([
            [
                'status' => 400,
                'body' => [
                    'ok' => false,
                    'error_code' => 400,
                    'description' => 'Bad Request: chat not found',
                ],
            ],
        ]);

        $this->app->instance(
            TelegramOrderNotifier::class,
            new class($httpClient) extends TelegramOrderNotifier
            {
                public function __construct(
                    private readonly HttpClientInterface $httpClient,
                ) {}

                protected function resolveHttpClientHandler(): ?HttpClientInterface
                {
                    return $this->httpClient;
                }
            }
        );

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

        $this->assertCount(1, $httpClient->requests);
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

final class RecordingTelegramHttpClient implements HttpClientInterface
{
    public array $requests = [];

    private int $timeout = 30;

    private int $connectTimeout = 10;

    private int $responseIndex = 0;

    /**
     * @param  list<array{status?: int, body?: array<string, mixed>}>  $responses
     */
    public function __construct(
        private readonly array $responses,
    ) {}

    public function send(
        string $url,
        string $method,
        array $headers = [],
        array $options = [],
        bool $isAsyncRequest = false
    ): ResponseInterface|PromiseInterface|null {
        $this->requests[] = [
            'url' => $url,
            'method' => $method,
            'headers' => $headers,
            'options' => $options,
            'is_async_request' => $isAsyncRequest,
        ];

        $response = $this->responses[$this->responseIndex] ?? end($this->responses);
        $this->responseIndex++;

        return new Response(
            $response['status'] ?? 200,
            ['Content-Type' => 'application/json'],
            json_encode($response['body'] ?? ['ok' => true], JSON_THROW_ON_ERROR)
        );
    }

    public function getTimeOut(): int
    {
        return $this->timeout;
    }

    public function setTimeOut(int $timeOut): static
    {
        $this->timeout = $timeOut;

        return $this;
    }

    public function getConnectTimeOut(): int
    {
        return $this->connectTimeout;
    }

    public function setConnectTimeOut(int $connectTimeOut): static
    {
        $this->connectTimeout = $connectTimeOut;

        return $this;
    }
}
