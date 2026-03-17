<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class AttributeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $attributes = Attribute::query()
            ->with(['categories', 'options'])
            ->orderBy('sort_order')
            ->orderByDesc('created_at');

        $this->applyTranslatableSearch($attributes, ['name', 'description'], $search);

        return Inertia::render('admin/attributes/index', [
            'filters' => [
                'search' => $search,
            ],
            'attributes' => $attributes->paginate(12)->withQueryString()->through(fn (Attribute $attribute) => [
                'id' => $attribute->id,
                'name' => $attribute->getTranslations('name'),
                'slug' => $attribute->getTranslations('slug'),
                'description' => $attribute->getTranslations('description'),
                'type' => $attribute->type,
                'is_filterable' => $attribute->is_filterable,
                'is_required' => $attribute->is_required,
                'is_active' => $attribute->is_active,
                'sort_order' => $attribute->sort_order,
                'supports_options' => in_array($attribute->type, ['select', 'multi_select'], true),
                'categories' => $attribute->categories->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->getTranslations('name'),
                ])->all(),
                'options_count' => $attribute->options->count(),
            ]),
            'attributeTypes' => $this->attributeTypes(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/attributes/form', [
            'mode' => 'create',
            'attribute' => [
                'name' => ['ro' => '', 'ru' => ''],
                'slug' => ['ro' => '', 'ru' => ''],
                'description' => ['ro' => '', 'ru' => ''],
                'type' => 'select',
                'is_filterable' => true,
                'is_required' => false,
                'is_active' => true,
                'sort_order' => 0,
                'category_ids' => [],
            ],
            'categoryTree' => $this->categoryTree(),
            'attributeTypes' => $this->attributeTypes(),
        ]);
    }

    public function edit(Attribute $attribute): Response
    {
        $attribute->load(['categories', 'options']);

        return Inertia::render('admin/attributes/form', [
            'mode' => 'edit',
            'attribute' => [
                'id' => $attribute->id,
                'name' => $attribute->getTranslations('name'),
                'slug' => $attribute->getTranslations('slug'),
                'description' => $attribute->getTranslations('description'),
                'type' => $attribute->type,
                'is_filterable' => $attribute->is_filterable,
                'is_required' => $attribute->is_required,
                'is_active' => $attribute->is_active,
                'sort_order' => $attribute->sort_order,
                'category_ids' => $attribute->categories->pluck('id')->all(),
            ],
            'categoryTree' => $this->categoryTree(),
            'attributeTypes' => $this->attributeTypes(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayload($request);

        $attribute = Attribute::create(Arr::except($validated, ['category_ids']));
        $attribute->categories()->sync($validated['category_ids'] ?? []);

        return to_route('admin.attributes.index')->with('success', 'Atributul a fost creat.');
    }

    public function update(Request $request, Attribute $attribute): RedirectResponse
    {
        $validated = $this->validatePayload($request);

        $attribute->update(Arr::except($validated, ['category_ids']));
        $attribute->categories()->sync($validated['category_ids'] ?? []);
        if (! in_array($validated['type'], ['select', 'multi_select'], true)) {
            $attribute->options()->delete();
        }

        return to_route('admin.attributes.index')->with('success', 'Atributul a fost actualizat.');
    }

    public function destroy(Attribute $attribute): RedirectResponse
    {
        $attribute->delete();

        return to_route('admin.attributes.index')->with('success', 'Atributul a fost șters.');
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'name.ro' => ['required', 'string', 'max:255'],
            'name.ru' => ['required', 'string', 'max:255'],
            'slug.ro' => ['nullable', 'string', 'max:255'],
            'slug.ru' => ['nullable', 'string', 'max:255'],
            'description.ro' => ['nullable', 'string'],
            'description.ru' => ['nullable', 'string'],
            'type' => ['required', 'in:select,multi_select,text,textarea,number,boolean'],
            'is_filterable' => ['required', 'boolean'],
            'is_required' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
        ]);
    }

    private function categoryTree(): array
    {
        return Category::query()
            ->with('childrenRecursive')
            ->whereNull('parent_id')
            ->orderBy('menu_order')
            ->get()
            ->map(fn (Category $category) => $this->mapCategoryNode($category))
            ->all();
    }

    private function mapCategoryNode(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->getTranslations('name'),
            'children' => $category->childrenRecursive->map(fn (Category $child) => $this->mapCategoryNode($child))->all(),
        ];
    }

    private function attributeTypes(): array
    {
        return [
            ['value' => 'select', 'label' => 'Select single'],
            ['value' => 'multi_select', 'label' => 'Select multiplu'],
            ['value' => 'text', 'label' => 'Text scurt'],
            ['value' => 'textarea', 'label' => 'Text lung'],
            ['value' => 'number', 'label' => 'Număr'],
            ['value' => 'boolean', 'label' => 'Da / Nu'],
        ];
    }
}
