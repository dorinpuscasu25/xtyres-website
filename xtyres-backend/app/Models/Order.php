<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'status',
        'locale',
        'customer_first_name',
        'customer_last_name',
        'customer_email',
        'customer_phone',
        'city',
        'street',
        'street_number',
        'postal_code',
        'payment_method',
        'currency',
        'subtotal',
        'total',
        'note',
        'admin_note',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getCustomerNameAttribute(): string
    {
        return trim($this->customer_first_name.' '.$this->customer_last_name);
    }
}
