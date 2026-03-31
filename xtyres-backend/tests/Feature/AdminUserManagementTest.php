<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

    public function test_admin_users_can_update_other_admin_users()
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $managedAdmin = User::factory()->create([
            'is_admin' => true,
            'email' => 'old-admin@example.com',
            'password' => 'old-password',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.users.update', $managedAdmin), [
            'name' => 'Admin Actualizat',
            'email' => 'new-admin@example.com',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertRedirect(route('admin.users.index'));

        $managedAdmin->refresh();

        $this->assertSame('Admin Actualizat', $managedAdmin->name);
        $this->assertSame('new-admin@example.com', $managedAdmin->email);
        $this->assertTrue(Hash::check('new-password', $managedAdmin->password));
    }

    public function test_admin_users_can_update_an_admin_without_changing_the_password()
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $managedAdmin = User::factory()->create([
            'is_admin' => true,
            'email' => 'stable-admin@example.com',
            'password' => 'existing-password',
        ]);
        $existingPasswordHash = $managedAdmin->password;

        $this->actingAs($admin)->put(route('admin.users.update', $managedAdmin), [
            'name' => '',
            'email' => 'renamed-admin@example.com',
            'password' => '',
            'password_confirmation' => '',
        ]);

        $managedAdmin->refresh();

        $this->assertSame('Renamed Admin', $managedAdmin->name);
        $this->assertSame('renamed-admin@example.com', $managedAdmin->email);
        $this->assertSame($existingPasswordHash, $managedAdmin->password);
    }

    public function test_admin_users_can_delete_other_admin_users()
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $managedAdmin = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $managedAdmin));

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseMissing('users', [
            'id' => $managedAdmin->id,
        ]);
    }

    public function test_admin_users_can_not_delete_their_own_account_from_the_admin_users_page()
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }

    public function test_last_admin_can_not_be_deleted()
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));

        $response->assertRedirect(route('admin.users.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }
}
