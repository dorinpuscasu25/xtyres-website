<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasTranslatedSlug
{
    public static function bootHasTranslatedSlug(): void
    {
        static::saving(function ($model): void {
            $model->generateTranslatedSlugs();
        });
    }

    protected function slugSourceField(): string
    {
        return property_exists($this, 'slugSourceField')
            ? $this->slugSourceField
            : 'name';
    }

    protected function slugFieldName(): string
    {
        return property_exists($this, 'slugFieldName')
            ? $this->slugFieldName
            : 'slug';
    }

    protected function generateTranslatedSlugs(): void
    {
        $sourceField = $this->slugSourceField();
        $slugField = $this->slugFieldName();

        $sourceTranslations = $this->getTranslations($sourceField);
        $slugTranslations = $this->getTranslations($slugField);

        foreach (config('store.locales', ['ro', 'ru']) as $locale) {
            $source = trim((string) ($sourceTranslations[$locale] ?? ''));

            if ($source === '') {
                continue;
            }

            $currentSlug = trim((string) ($slugTranslations[$locale] ?? ''));
            $slugTranslations[$locale] = $currentSlug !== '' ? Str::slug($currentSlug) : Str::slug($source);
        }

        $this->setTranslations($slugField, $slugTranslations);
    }
}
