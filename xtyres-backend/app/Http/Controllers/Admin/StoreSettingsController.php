<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingsController extends Controller
{
    public function edit(): Response
    {
        $settings = StoreSetting::current();

        return Inertia::render('admin/settings/edit', [
            'settings' => [
                'site_name' => $settings->getTranslations('site_name'),
                'site_description' => $settings->getTranslations('site_description'),
                'footer_text' => $settings->getTranslations('footer_text'),
                'contact_address' => $settings->getTranslations('contact_address'),
                'working_hours' => $settings->getTranslations('working_hours'),
                'emails' => $settings->emails ?? [''],
                'phones' => $settings->phones ?? [''],
                'social_links' => $settings->social_links ?? [],
                'map_embed_url' => $settings->map_embed_url,
                'header_logo_url' => $settings->header_logo_url,
                'footer_logo_url' => $settings->footer_logo_url,
                'remove_header_logo' => false,
                'remove_footer_logo' => false,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'site_name.ro' => ['required', 'string', 'max:255'],
            'site_name.ru' => ['required', 'string', 'max:255'],
            'site_description.ro' => ['nullable', 'string'],
            'site_description.ru' => ['nullable', 'string'],
            'footer_text.ro' => ['nullable', 'string'],
            'footer_text.ru' => ['nullable', 'string'],
            'contact_address.ro' => ['nullable', 'string'],
            'contact_address.ru' => ['nullable', 'string'],
            'working_hours.ro' => ['nullable', 'string'],
            'working_hours.ru' => ['nullable', 'string'],
            'emails' => ['nullable', 'array'],
            'emails.*' => ['nullable', 'email'],
            'phones' => ['nullable', 'array'],
            'phones.*' => ['nullable', 'string', 'max:50'],
            'social_links' => ['nullable', 'array'],
            'social_links.*.name' => ['required_with:social_links', 'string', 'max:100'],
            'social_links.*.url' => ['required_with:social_links', 'url', 'max:255'],
            'map_embed_url' => ['nullable', 'url', 'max:255'],
            'header_logo' => ['nullable', 'image', 'max:4096'],
            'footer_logo' => ['nullable', 'image', 'max:4096'],
            'remove_header_logo' => ['nullable', 'boolean'],
            'remove_footer_logo' => ['nullable', 'boolean'],
        ]);

        $settings = StoreSetting::current();
        $settings->update([
            ...$validated,
            'emails' => array_values(array_filter($validated['emails'] ?? [])),
            'phones' => array_values(array_filter($validated['phones'] ?? [])),
            'social_links' => array_values(array_filter(
                $validated['social_links'] ?? [],
                fn (array $item) => filled($item['name'] ?? null) && filled($item['url'] ?? null)
            )),
            'header_logo_path' => $this->replacePublicFile(
                $request->file('header_logo'),
                $settings->header_logo_path,
                'settings',
                $request->boolean('remove_header_logo')
            ),
            'footer_logo_path' => $this->replacePublicFile(
                $request->file('footer_logo'),
                $settings->footer_logo_path,
                'settings',
                $request->boolean('remove_footer_logo')
            ),
        ]);

        return to_route('admin.settings.edit')->with('success', 'Setările au fost salvate.');
    }
}
