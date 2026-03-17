<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $categories = Category::query()
            ->with('parent')
            ->orderBy('menu_order')
            ->orderByDesc('created_at');

        $this->applyTranslatableSearch($categories, ['name', 'description'], $search);

        return Inertia::render('admin/categories/index', [
            'filters' => [
                'search' => $search,
            ],
            'categories' => $categories->paginate(12)->withQueryString()->through(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->getTranslations('name'),
                'slug' => $category->getTranslations('slug'),
                'description' => $category->getTranslations('description'),
                'parent' => $category->parent ? [
                    'id' => $category->parent->id,
                    'name' => $category->parent->getTranslations('name'),
                ] : null,
                'image_url' => $category->image_url,
                'is_active' => $category->is_active,
                'is_featured' => $category->is_featured,
                'menu_order' => $category->menu_order,
                'products_count' => $category->products()->count(),
                'children_count' => $category->children()->count(),
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/form', [
            'mode' => 'create',
            'category' => [
                'name' => ['ro' => '', 'ru' => ''],
                'slug' => ['ro' => '', 'ru' => ''],
                'description' => ['ro' => '', 'ru' => ''],
                'parent_id' => null,
                'icon' => '',
                'image_url' => null,
                'remove_image' => false,
                'is_active' => true,
                'is_featured' => false,
                'menu_order' => 0,
            ],
            'categoryTree' => $this->categoryTree(),
        ]);
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/form', [
            'mode' => 'edit',
            'category' => [
                'id' => $category->id,
                'name' => $category->getTranslations('name'),
                'slug' => $category->getTranslations('slug'),
                'description' => $category->getTranslations('description'),
                'parent_id' => $category->parent_id,
                'icon' => $category->icon,
                'image_url' => $category->image_url,
                'remove_image' => false,
                'is_active' => $category->is_active,
                'is_featured' => $category->is_featured,
                'menu_order' => $category->menu_order,
            ],
            'categoryTree' => $this->categoryTree($category),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request);

        Category::create([
            ...$validated,
            'image_path' => $this->storePublicFile($request->file('image'), 'categories'),
        ]);

        return to_route('admin.categories.index')->with('success', 'Categoria a fost creată.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $this->validatePayload($request, $category);

        $category->update([
            ...$validated,
            'image_path' => $this->replacePublicFile(
                $request->file('image'),
                $category->image_path,
                'categories',
                $request->boolean('remove_image')
            ),
        ]);

        return to_route('admin.categories.index')->with('success', 'Categoria a fost actualizată.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->replacePublicFile(null, $category->image_path, 'categories', true);
        $category->delete();

        return to_route('admin.categories.index')->with('success', 'Categoria a fost ștearsă.');
    }

    private function validatePayload(Request $request, ?Category $category = null): array
    {
        $excludeIds = $category ? $this->descendantIds($category) : [];
        $parentRules = ['nullable', 'integer', 'exists:categories,id'];

        $blockedParentIds = array_filter([$category?->id, ...$excludeIds]);

        if ($blockedParentIds !== []) {
            $parentRules[] = 'not_in:'.implode(',', $blockedParentIds);
        }

        return $request->validate([
            'name.ro' => ['required', 'string', 'max:255'],
            'name.ru' => ['required', 'string', 'max:255'],
            'slug.ro' => ['nullable', 'string', 'max:255'],
            'slug.ru' => ['nullable', 'string', 'max:255'],
            'description.ro' => ['nullable', 'string'],
            'description.ru' => ['nullable', 'string'],
            'parent_id' => $parentRules,
            'icon' => ['nullable', 'string', 'max:100'],
            'image' => ['nullable', 'image', 'max:4096'],
            'remove_image' => ['nullable', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
            'menu_order' => ['nullable', 'integer', 'min:0'],
        ]);
    }

    private function categoryTree(?Category $excludedCategory = null): array
    {
        $excludedIds = $excludedCategory ? [$excludedCategory->id, ...$this->descendantIds($excludedCategory)] : [];

        $roots = Category::query()
            ->with('childrenRecursive')
            ->whereNull('parent_id')
            ->whereNotIn('id', $excludedIds)
            ->orderBy('menu_order')
            ->get();

        return $roots->map(fn (Category $category) => $this->mapCategoryNode($category, $excludedIds))->all();
    }

    private function mapCategoryNode(Category $category, array $excludedIds = []): array
    {
        return [
            'id' => $category->id,
            'name' => $category->getTranslations('name'),
            'children' => $category->childrenRecursive
                ->reject(fn (Category $child) => in_array($child->id, $excludedIds, true))
                ->map(fn (Category $child) => $this->mapCategoryNode($child, $excludedIds))
                ->values()
                ->all(),
        ];
    }

    private function descendantIds(Category $category): array
    {
        $category->loadMissing('childrenRecursive');

        $ids = [];
        $walk = function (Category $node) use (&$walk, &$ids): void {
            foreach ($node->childrenRecursive as $child) {
                $ids[] = $child->id;
                $walk($child);
            }
        };

        $walk($category);

        return $ids;
    }
}
