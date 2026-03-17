<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Spatie\Translatable\HasTranslations;

class StoreSetting extends Model
{
    use HasFactory;
    use HasTranslations;

    protected $fillable = [
        'site_name',
        'site_description',
        'footer_text',
        'contact_address',
        'working_hours',
        'emails',
        'phones',
        'social_links',
        'header_logo_path',
        'footer_logo_path',
        'map_embed_url',
    ];

    public array $translatable = [
        'site_name',
        'site_description',
        'footer_text',
        'contact_address',
        'working_hours',
    ];

    protected $casts = [
        'emails' => 'array',
        'phones' => 'array',
        'social_links' => 'array',
    ];

    protected $appends = [
        'header_logo_url',
        'footer_logo_url',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'site_name' => [
                'ro' => 'XTyres',
                'ru' => 'XTyres',
            ],
            'emails' => ['info@xtyres.md'],
            'phones' => ['+37361116665'],
            'social_links' => [],
        ]);
    }

    public function getHeaderLogoUrlAttribute(): ?string
    {
        return $this->header_logo_path ? Storage::disk('public')->url($this->header_logo_path) : null;
    }

    public function getFooterLogoUrlAttribute(): ?string
    {
        return $this->footer_logo_path ? Storage::disk('public')->url($this->footer_logo_path) : null;
    }
}
