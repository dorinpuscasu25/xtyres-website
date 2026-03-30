<?php

namespace App\Support;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Log;
use Telegram\Bot\Api;
use Telegram\Bot\Exceptions\TelegramResponseException;
use Telegram\Bot\HttpClients\HttpClientInterface;
use Throwable;

class TelegramOrderNotifier
{
    private const BOT_TOKEN = '2018095725:AAGoJbONadK3LnkpA3_2UB0Y_RygRERQFGQ';

    private const CHAT_ID = '-583530233';

    private const CONNECT_TIMEOUT_SECONDS = 10;

    private const REQUEST_TIMEOUT_SECONDS = 10;

    private const MAX_ATTEMPTS = 3;

    public function sendNewOrderNotification(Order $order): void
    {
        $order = $order->loadMissing('items');
        $payload = $this->payload($order);

        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; $attempt++) {
            try {
                $message = $this->createTelegramApi()->sendMessage($payload);

                Log::info('Telegram notification sent.', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'chat_id' => self::CHAT_ID,
                    'telegram_message_id' => $message->messageId,
                ]);

                return;
            } catch (TelegramResponseException $exception) {
                if ($attempt < self::MAX_ATTEMPTS && $this->shouldRetry($exception->getHttpStatusCode())) {
                    continue;
                }

                Log::error('Telegram notification failed.', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'chat_id' => self::CHAT_ID,
                    'status' => $exception->getHttpStatusCode(),
                    'body' => $exception->getRawResponse(),
                    'message' => $exception->getMessage(),
                ]);

                return;
            } catch (Throwable $exception) {
                if ($attempt < self::MAX_ATTEMPTS) {
                    continue;
                }

                Log::error('Telegram notification exception.', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'chat_id' => self::CHAT_ID,
                    'message' => $exception->getMessage(),
                ]);

                report($exception);

                return;
            }
        }
    }

    protected function createTelegramApi(): Api
    {
        return tap(new Api(self::BOT_TOKEN, false, $this->resolveHttpClientHandler()), function (Api $telegram): void {
            $telegram->setTimeOut(self::REQUEST_TIMEOUT_SECONDS);
            $telegram->setConnectTimeOut(self::CONNECT_TIMEOUT_SECONDS);
        });
    }

    protected function resolveHttpClientHandler(): ?HttpClientInterface
    {
        return null;
    }

    private function shouldRetry(?int $statusCode): bool
    {
        return $statusCode === null || $statusCode === 429 || $statusCode >= 500;
    }

    private function payload(Order $order): array
    {
        return [
            'chat_id' => self::CHAT_ID,
            'text' => $this->buildMessage($order),
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ];
    }

    private function buildMessage(Order $order): string
    {
        $customerName = trim($order->customer_first_name.' '.$order->customer_last_name);
        $items = $order->items
            ->map(fn (OrderItem $item) => $this->buildItemLine($item, $order->locale))
            ->implode("\n");

        $lines = [
            '<b>Comanda noua</b>',
            '<b>Număr:</b> '.$this->escape($order->order_number),
            '<b>Client:</b> '.$this->escape($customerName),
            '<b>Telefon:</b> '.$this->escape($order->customer_phone),
            '<b>Email:</b> '.$this->escape($order->customer_email ?: '—'),
            '<b>Adresă:</b> '.$this->escape($this->formatAddress($order)),
            '<b>Plată:</b> '.$this->escape(strtoupper($order->payment_method)),
            '<b>Total:</b> '.$this->formatMoney((float) $order->total).' '.$this->escape($order->currency),
            '<b>Limbă:</b> '.$this->escape(strtoupper($order->locale)),
            '',
            '<b>Produse:</b>',
            $items !== '' ? $items : '—',
        ];

        if (filled($order->note)) {
            $lines[] = '';
            $lines[] = '<b>Notă client:</b> '.$this->escape((string) $order->note);
        }

        return implode("\n", $lines);
    }

    private function buildItemLine(OrderItem $item, string $locale): string
    {
        $name = $item->getTranslation('product_name', $locale, false)
            ?: $item->getTranslation('product_name', 'ro', false)
            ?: $item->sku
            ?: 'Produs fără nume';

        $line = '• '.$this->escape($name).' x'.$item->quantity.' - '.$this->formatMoney((float) $item->total_price).' MDL';

        if (! empty($item->sku)) {
            $line .= ' (SKU: '.$this->escape((string) $item->sku).')';
        }

        return $line;
    }

    private function formatAddress(Order $order): string
    {
        return trim(implode(', ', array_filter([
            $order->city,
            trim($order->street.' '.$order->street_number),
            $order->postal_code,
        ])));
    }

    private function formatMoney(float $amount): string
    {
        return number_format($amount, 2, '.', '');
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
