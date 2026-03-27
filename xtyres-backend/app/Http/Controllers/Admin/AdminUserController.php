<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    use PasswordValidationRules, ProfileValidationRules;

    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->where('is_admin', true)
                ->orderBy('name')
                ->orderBy('email')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => optional($user->created_at)->format('d.m.Y H:i'),
                ])
                ->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => $this->emailRules(),
            'password' => $this->passwordRules(),
        ]);

        $name = trim((string) ($validated['name'] ?? ''));
        $email = Str::lower((string) $validated['email']);

        User::create([
            'name' => $name !== '' ? $name : $this->resolveDisplayName($email),
            'email' => $email,
            'password' => $validated['password'],
            'is_admin' => true,
        ]);

        return to_route('admin.users.index')->with('success', 'Administratorul a fost adăugat.');
    }

    private function resolveDisplayName(string $email): string
    {
        return (string) Str::of($email)
            ->before('@')
            ->replace(['.', '_', '-'], ' ')
            ->squish()
            ->title();
    }
}
