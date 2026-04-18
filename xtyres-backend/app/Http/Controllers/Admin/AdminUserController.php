<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    use PasswordValidationRules, ProfileValidationRules;

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $perPage = $this->resolvePerPage($request);

        $users = User::query()
            ->where('is_admin', true)
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('name')
            ->orderBy('email');
        $adminCount = User::query()->where('is_admin', true)->count();
        $currentUserId = auth()->id();

        return Inertia::render('admin/users/index', [
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'users' => $users
                ->paginate($perPage)
                ->withQueryString()
                ->through(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => optional($user->created_at)->format('d.m.Y H:i'),
                    'is_current_user' => $currentUserId === $user->id,
                    'can_delete' => $adminCount > 1 && $currentUserId !== $user->id,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateAdminUser($request);
        $email = $this->normalizeEmail((string) $validated['email']);

        User::create([
            'name' => $this->resolveName($validated['name'] ?? null, $email),
            'email' => $email,
            'password' => $validated['password'],
            'is_admin' => true,
        ]);

        return to_route('admin.users.index')->with('success', 'Administratorul a fost adăugat.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $admin = $this->resolveAdminUser($user);
        $validated = $this->validateAdminUser($request, $admin->id, false);
        $email = $this->normalizeEmail((string) $validated['email']);

        $admin->forceFill([
            'name' => $this->resolveName($validated['name'] ?? null, $email),
            'email' => $email,
        ]);

        if (filled($validated['password'] ?? null)) {
            $admin->password = $validated['password'];
        }

        $admin->save();

        return to_route('admin.users.index')->with('success', 'Administratorul a fost actualizat.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $admin = $this->resolveAdminUser($user);

        if ($request->user()?->is($admin)) {
            return to_route('admin.users.index')->with('error', 'Contul tău nu poate fi șters din această pagină.');
        }

        if (User::query()->where('is_admin', true)->count() <= 1) {
            return to_route('admin.users.index')->with('error', 'Trebuie să rămână cel puțin un administrator activ.');
        }

        $admin->delete();

        return to_route('admin.users.index')->with('success', 'Administratorul a fost șters.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateAdminUser(
        Request $request,
        ?int $userId = null,
        bool $passwordRequired = true,
    ): array {
        return $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => $this->emailRules($userId),
            'password' => $passwordRequired
                ? $this->passwordRules()
                : ['nullable', 'string', Password::default(), 'confirmed'],
        ]);
    }

    private function resolveAdminUser(User $user): User
    {
        abort_unless($user->is_admin, 404);

        return $user;
    }

    private function resolveName(?string $name, string $email): string
    {
        $resolvedName = trim((string) $name);

        return $resolvedName !== '' ? $resolvedName : $this->resolveDisplayName($email);
    }

    private function normalizeEmail(string $email): string
    {
        return Str::lower($email);
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
