<?php

namespace App\Support;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Http;
use Throwable;

class TelegramOrderNotifier
{
    private const BOT_TOKEN = '2018095725:AAGoJbONadK3LnkpA3_2UB0Y_RygRERQFGQ';

    private const CHAT_ID = '-583530233';

    public function sendNewOrderNotification(Order $order): void
    {
        try {
            $response = Http::asForm()
                ->timeout(10)
                ->retry(2, 500)
                ->post($this->endpoint(), [
                    'chat_id' => self::CHAT_ID,
                    'text' => $this->buildMessage($order->loadMissing('items')),
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ]);

            if ($response->failed()) {
                report(new \RuntimeException('Telegram notification failed: '.$response->body()));
            }
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    private function endpoint(): string
    {
        return 'https://api.telegram.org/bot'.self::BOT_TOKEN.'/sendMessage';
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
