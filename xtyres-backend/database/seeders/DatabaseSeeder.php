<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate([
            'email' => env('ADMIN_EMAIL', 'admin@xtyres.local'),
        ], [
            'name' => 'Admin',
            'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        $this->call(StoreDemoSeeder::class);
    }
}
