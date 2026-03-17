<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->firstOrNew([
            'email' => env('ADMIN_EMAIL', 'admin@xtyres.local'),
        ]);

        if (! $user->exists) {
            $user->name = 'Admin';
            $user->password = Hash::make(env('ADMIN_PASSWORD', 'password'));
            $user->email_verified_at = now();
        }

        $user->is_admin = true;
        $user->save();
    }
}
