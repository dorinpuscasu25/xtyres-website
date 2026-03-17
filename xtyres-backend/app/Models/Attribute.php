<?php

namespace App\Models;

use App\Models\Concerns\HasTranslatedSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Attribute extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasTranslatedSlug;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'is_filterable',
        'is_required',
        'is_active',
        'sort_order',
    ];

    public array $translatable = [
        'name',
        'slug',
        'description',
    ];

    protected $casts = [
        'is_filterable' => 'boolean',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    public function options(): HasMany
    {
        return $this->hasMany(AttributeOption::class)->orderBy('sort_order');
    }

    public function productValues(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class);
    }
}
