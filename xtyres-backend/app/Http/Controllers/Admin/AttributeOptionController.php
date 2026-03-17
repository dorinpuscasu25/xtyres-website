<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeOption;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttributeOptionController extends Controller
{
    public function index(Request $request, Attribute $attribute): Response
    {
        $search = $request->string('search')->toString();

        $options = $attribute->options()->orderBy('sort_order')->orderBy('id');

        if ($search !== '') {
            $this->applyTranslatableSearch($options, ['value'], $search);
        }

        return Inertia::render('admin/attributes/options/index', [
            'attribute' => $this->attributePayload($attribute),
            'filters' => [
                'search' => $search,
            ],
            'options' => $options->paginate(12)->withQueryString()->through(fn (AttributeOption $option) => [
                'id' => $option->id,
                'value' => $option->getTranslations('value'),
                'sort_order' => $option->sort_order,
                'is_active' => $option->is_active,
                'products_count' => $option->productValues()->count(),
            ]),
        ]);
    }

    public function create(Attribute $attribute): Response
    {
        $this->ensureOptionsSupported($attribute);

        return Inertia::render('admin/attributes/options/form', [
            'mode' => 'create',
            'attribute' => $this->attributePayload($attribute),
            'option' => [
                'value' => ['ro' => '', 'ru' => ''],
                'sort_order' => 0,
                'is_active' => true,
            ],
        ]);
    }

    public function store(Request $request, Attribute $attribute): RedirectResponse
    {
        $this->ensureOptionsSupported($attribute);
        $validated = $this->validatePayload($request);

        $attribute->options()->create($validated);

        return to_route('admin.attributes.options.index', $attribute)->with('success', 'Opțiunea a fost creată.');
    }

    public function edit(Attribute $attribute, AttributeOption $option): Response
    {
        $this->ensureAttributeRelation($attribute, $option);

        return Inertia::render('admin/attributes/options/form', [
            'mode' => 'edit',
            'attribute' => $this->attributePayload($attribute),
            'option' => [
                'id' => $option->id,
                'value' => $option->getTranslations('value'),
                'sort_order' => $option->sort_order,
                'is_active' => $option->is_active,
            ],
        ]);
    }

    public function update(Request $request, Attribute $attribute, AttributeOption $option): RedirectResponse
    {
        $this->ensureAttributeRelation($attribute, $option);
        $validated = $this->validatePayload($request);

        $option->update($validated);

        return to_route('admin.attributes.options.index', $attribute)->with('success', 'Opțiunea a fost actualizată.');
    }

    public function destroy(Attribute $attribute, AttributeOption $option): RedirectResponse
    {
        $this->ensureAttributeRelation($attribute, $option);
        $option->delete();

        return to_route('admin.attributes.options.index', $attribute)->with('success', 'Opțiunea a fost ștearsă.');
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'value.ro' => ['required', 'string', 'max:255'],
            'value.ru' => ['required', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);
    }

    private function ensureOptionsSupported(Attribute $attribute): void
    {
        abort_unless(in_array($attribute->type, ['select', 'multi_select'], true), 404);
    }

    private function ensureAttributeRelation(Attribute $attribute, AttributeOption $option): void
    {
        $this->ensureOptionsSupported($attribute);
        abort_unless($option->attribute_id === $attribute->id, 404);
    }

    private function attributePayload(Attribute $attribute): array
    {
        return [
            'id' => $attribute->id,
            'name' => $attribute->getTranslations('name'),
            'slug' => $attribute->getTranslations('slug'),
            'type' => $attribute->type,
        ];
    }
}
