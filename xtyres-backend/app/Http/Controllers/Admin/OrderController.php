<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $orders = Order::query()
            ->withCount('items')
            ->latest();

        if ($search !== '') {
            $orders->where(function (Builder $query) use ($search) {
                $query
                    ->where('order_number', 'like', '%'.$search.'%')
                    ->orWhere('customer_first_name', 'like', '%'.$search.'%')
                    ->orWhere('customer_last_name', 'like', '%'.$search.'%')
                    ->orWhere('customer_phone', 'like', '%'.$search.'%')
                    ->orWhere('customer_email', 'like', '%'.$search.'%');
            });
        }

        if ($status !== '') {
            $orders->where('status', $status);
        }

        return Inertia::render('admin/orders/index', [
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statuses' => $this->statuses(),
            'orders' => $orders->paginate(12)->withQueryString()->through(fn (Order $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'customer_email' => $order->customer_email,
                'payment_method' => $order->payment_method,
                'items_count' => $order->items_count,
                'total' => (float) $order->total,
                'created_at' => optional($order->created_at)->format('d.m.Y H:i'),
            ]),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items.product']);

        return Inertia::render('admin/orders/show', [
            'statuses' => $this->statuses(),
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'locale' => $order->locale,
                'payment_method' => $order->payment_method,
                'currency' => $order->currency,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total,
                'note' => $order->note,
                'admin_note' => $order->admin_note,
                'created_at' => optional($order->created_at)->format('d.m.Y H:i'),
                'customer' => [
                    'first_name' => $order->customer_first_name,
                    'last_name' => $order->customer_last_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                    'city' => $order->city,
                    'street' => $order->street,
                    'street_number' => $order->street_number,
                    'postal_code' => $order->postal_code,
                ],
                'items' => $order->items->map(fn (OrderItem $item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->getTranslations('product_name'),
                    'sku' => $item->sku,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total_price' => (float) $item->total_price,
                    'attributes_snapshot' => $item->attributes_snapshot ?? [],
                ])->all(),
            ],
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:new,confirmed,processing,completed,cancelled'],
            'admin_note' => ['nullable', 'string'],
        ]);

        $order->update($validated);

        return back()->with('success', 'Comanda a fost actualizată.');
    }

    private function statuses(): array
    {
        return [
            ['value' => 'new', 'label' => 'Nouă'],
            ['value' => 'confirmed', 'label' => 'Confirmată'],
            ['value' => 'processing', 'label' => 'În procesare'],
            ['value' => 'completed', 'label' => 'Finalizată'],
            ['value' => 'cancelled', 'label' => 'Anulată'],
        ];
    }
}
