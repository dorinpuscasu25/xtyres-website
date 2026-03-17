<?php

namespace App\Models;

use App\Models\Concerns\HasTranslatedSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;
use Spatie\Translatable\HasTranslations;

class Product extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasTranslatedSlug;

    protected $fillable = [
        'brand_id',
        'primary_category_id',
        'name',
        'slug',
        'short_description',
        'description',
        'meta_title',
        'meta_keywords',
        'meta_description',
        'sku',
        'price',
        'compare_at_price',
        'stock_quantity',
        'image_path',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    public array $translatable = [
        'name',
        'slug',
        'short_description',
        'description',
        'meta_title',
        'meta_keywords',
        'meta_description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function primaryCategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'primary_category_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    public function attributeValues(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class)->with(['attribute', 'option']);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function thumbnailImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function getImageUrlAttribute(): ?string
    {
        if ($this->relationLoaded('images')) {
            return $this->images->first()?->image_url
                ?? ($this->image_path ? Storage::disk('public')->url($this->image_path) : null);
        }

        if ($this->relationLoaded('thumbnailImage')) {
            return $this->thumbnailImage?->image_url
                ?? ($this->image_path ? Storage::disk('public')->url($this->image_path) : null);
        }

        $thumbnail = $this->images()->first();

        if ($thumbnail) {
            return $thumbnail->image_url;
        }

        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
    }
}
