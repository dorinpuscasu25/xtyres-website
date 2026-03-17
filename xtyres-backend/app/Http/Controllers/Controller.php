<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

abstract class Controller
{
    protected function supportedLocales(): array
    {
        return config('store.locales', ['ro', 'ru']);
    }

    protected function defaultLocale(): string
    {
        return config('store.default_locale', 'ro');
    }

    protected function localize(null|array|string $value, ?string $locale = null): ?string
    {
        if (is_string($value)) {
            return $value;
        }

        if (! is_array($value)) {
            return null;
        }

        $locale ??= $this->defaultLocale();

        return $value[$locale]
            ?? $value[$this->defaultLocale()]
            ?? collect($value)->filter(fn ($item) => filled($item))->first();
    }

    protected function applyTranslatableSearch(Builder $query, array $columns, ?string $term): void
    {
        $term = trim((string) $term);

        if ($term === '') {
            return;
        }

        $driver = DB::connection()->getDriverName();

        $query->where(function (Builder $nested) use ($columns, $term, $driver) {
            $firstCondition = true;

            foreach ($columns as $column) {
                foreach ($this->supportedLocales() as $locale) {
                    if ($driver === 'pgsql') {
                        $method = $firstCondition ? 'whereRaw' : 'orWhereRaw';
                        $nested->{$method}(
                            "LOWER(COALESCE({$column}->>?, '')) LIKE LOWER(?)",
                            [$locale, '%'.$term.'%']
                        );
                    } else {
                        $method = $firstCondition ? 'where' : 'orWhere';
                        $nested->{$method}($column.'->'.$locale, 'like', '%'.$term.'%');
                    }

                    $firstCondition = false;
                }
            }
        });
    }

    protected function applyTranslatableExactMatch(Builder $query, string $column, string $value, ?string $locale = null): void
    {
        $locale ??= $this->defaultLocale();
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            $query->whereRaw("{$column}->>? = ?", [$locale, $value]);

            return;
        }

        $query->where($column.'->'.$locale, $value);
    }

    protected function storePublicFile(?UploadedFile $file, string $directory): ?string
    {
        if (! $file) {
            return null;
        }

        return $file->store($directory, 'public');
    }

    protected function replacePublicFile(?UploadedFile $file, ?string $currentPath, string $directory, bool $removeCurrent = false): ?string
    {
        if ($removeCurrent && $currentPath) {
            Storage::disk('public')->delete($currentPath);
            $currentPath = null;
        }

        if (! $file) {
            return $currentPath;
        }

        if ($currentPath) {
            Storage::disk('public')->delete($currentPath);
        }

        return $this->storePublicFile($file, $directory);
    }
}
