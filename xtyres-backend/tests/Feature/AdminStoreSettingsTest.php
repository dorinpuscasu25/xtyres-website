<?php

namespace Tests\Feature;

use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminStoreSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_users_can_upload_a_header_logo()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($user)->put(route('admin.settings.update'), [
            'site_name' => ['ro' => 'XTyres', 'ru' => 'XTyres'],
            'site_description' => ['ro' => '', 'ru' => ''],
            'footer_text' => ['ro' => '', 'ru' => ''],
            'contact_address' => ['ro' => '', 'ru' => ''],
            'working_hours' => ['ro' => '', 'ru' => ''],
            'emails' => [],
            'phones' => [],
            'social_links' => [],
            'map_embed_url' => null,
            'header_logo' => UploadedFile::fake()->image('header-logo.png', 200, 80),
        ]);

        $response->assertRedirect(route('admin.settings.edit'));

        $settings = StoreSetting::current()->fresh();

        $this->assertNotNull($settings->header_logo_path);
        Storage::disk('public')->assertExists($settings->header_logo_path);
    }
}
