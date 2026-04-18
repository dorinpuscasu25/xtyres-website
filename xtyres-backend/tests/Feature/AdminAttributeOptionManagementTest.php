<?php

namespace Tests\Feature;

use App\Models\Attribute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAttributeOptionManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_attribute_option_store_keeps_https_redirects_behind_a_proxy(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $attribute = Attribute::query()->create([
            'name' => ['ro' => 'Lățime', 'ru' => 'Ширина'],
            'slug' => ['ro' => 'latime', 'ru' => 'shirina'],
            'description' => ['ro' => '', 'ru' => ''],
            'type' => 'select',
            'is_filterable' => true,
            'is_required' => false,
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $response = $this
            ->withServerVariables([
                'HTTP_X_FORWARDED_PROTO' => 'https',
                'HTTP_X_FORWARDED_HOST' => 'api.xtyres.md',
                'HTTP_HOST' => 'api.xtyres.md',
            ])
            ->actingAs($admin)
            ->post(route('admin.attributes.options.store', $attribute, false), [
                'value' => [
                    'ro' => '225',
                    'ru' => '225',
                ],
                'sort_order' => 0,
                'is_active' => true,
            ]);

        $response->assertRedirect(
            'https://api.xtyres.md/admin/attributes/'.$attribute->id.'/options',
        );
    }
}
