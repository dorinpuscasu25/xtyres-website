<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_users_can_view_the_admin_users_page()
    {
        $user = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($user)->get(route('admin.users.index'));

        $response->assertOk();
    }

    public function test_non_admin_users_can_not_view_the_admin_users_page()
    {
        $user = User::factory()->create([
            'is_admin' => false,
        ]);

        $response = $this->actingAs($user)->get(route('admin.users.index'));

        $response->assertForbidden();
    }

    public function test_admin_users_can_create_other_admin_users()
    {
        $user = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($user)->post(route('admin.users.store'), [
            'name' => 'Al Doilea Admin',
            'email' => 'second-admin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'Al Doilea Admin',
            'email' => 'second-admin@example.com',
            'is_admin' => true,
        ]);
    }

    public function test_admin_name_is_generated_from_email_when_it_is_missing()
    {
        $user = User::factory()->create([
            'is_admin' => true,
        ]);

        $this->actingAs($user)->post(route('admin.users.store'), [
            'name' => '',
            'email' => 'service.manager@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Service Manager',
            'email' => 'service.manager@example.com',
            'is_admin' => true,
        ]);
    }
}
