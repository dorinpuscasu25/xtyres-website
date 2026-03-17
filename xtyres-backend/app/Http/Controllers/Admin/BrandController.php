<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $brands = Brand::query()
            ->orderBy('sort_order')
            ->orderByDesc('created_at');

        $this->applyTranslatableSearch($brands, ['name', 'description'], $search);

        return Inertia::render('admin/brands/index', [
            'filters' => [
                'search' => $search,
            ],
            'brands' => $brands->paginate(10)->withQueryString()->through(fn (Brand $brand) => [
                'id' => $brand->id,
                'name' => $brand->getTranslations('name'),
                'slug' => $brand->getTranslations('slug'),
                'description' => $brand->getTranslations('description'),
                'website_url' => $brand->website_url,
                'logo_url' => $brand->logo_url,
                'is_active' => $brand->is_active,
                'sort_order' => $brand->sort_order,
                'products_count' => $brand->products()->count(),
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/brands/form', [
            'mode' => 'create',
            'brand' => [
                'name' => ['ro' => '', 'ru' => ''],
                'slug' => ['ro' => '', 'ru' => ''],
                'description' => ['ro' => '', 'ru' => ''],
                'website_url' => '',
                'logo_url' => null,
                'remove_logo' => false,
                'is_active' => true,
                'sort_order' => 0,
            ],
        ]);
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('admin/brands/form', [
            'mode' => 'edit',
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->getTranslations('name'),
                'slug' => $brand->getTranslations('slug'),
                'description' => $brand->getTranslations('description'),
                'website_url' => $brand->website_url,
                'logo_url' => $brand->logo_url,
                'remove_logo' => false,
                'is_active' => $brand->is_active,
                'sort_order' => $brand->sort_order,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request, null);

        Brand::create([
            ...$validated,
            'logo_path' => $this->storePublicFile($request->file('logo'), 'brands'),
        ]);

        return to_route('admin.brands.index')->with('success', 'Brand creat cu succes.');
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $validated = $this->validatePayload($request, $brand->id);

        $brand->update([
            ...$validated,
            'logo_path' => $this->replacePublicFile(
                $request->file('logo'),
                $brand->logo_path,
                'brands',
                $request->boolean('remove_logo')
            ),
        ]);

        return to_route('admin.brands.index')->with('success', 'Brand actualizat cu succes.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        $this->replacePublicFile(null, $brand->logo_path, 'brands', true);
        $brand->delete();

        return to_route('admin.brands.index')->with('success', 'Brand șters cu succes.');
    }

    private function validatePayload(Request $request, ?int $brandId): array
    {
        return $request->validate([
            'name.ro' => ['required', 'string', 'max:255'],
            'name.ru' => ['required', 'string', 'max:255'],
            'slug.ro' => ['nullable', 'string', 'max:255'],
            'slug.ru' => ['nullable', 'string', 'max:255'],
            'description.ro' => ['nullable', 'string'],
            'description.ru' => ['nullable', 'string'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'logo' => [$brandId ? 'nullable' : 'nullable', 'image', 'max:4096'],
            'remove_logo' => ['nullable', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }
}
