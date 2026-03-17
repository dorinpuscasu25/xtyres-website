<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

class ProductAttributeValue extends Model
{
    use HasFactory;
    use HasTranslations;

    protected $fillable = [
        'product_id',
        'attribute_id',
        'attribute_option_id',
        'text_value',
        'number_value',
        'boolean_value',
        'sort_order',
    ];

    public array $translatable = [
        'text_value',
    ];

    protected $casts = [
        'number_value' => 'decimal:2',
        'boolean_value' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(AttributeOption::class, 'attribute_option_id');
    }
}
