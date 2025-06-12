<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
// use Illuminate\Auth\Events\Registered; // Typically not fired by admin creation

class UserController extends Controller
{
    protected function baseInertiaPath(): string
    {
        return 'Admin/Users/';
    }

    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->input('role'), fn($query, $role) => $query->where('role', $role))
            ->orderBy('name')
            ->paginate(40)
            ->withQueryString();

        // For role filter dropdown
        $roles = User::select('role')->distinct()->whereNotNull('role')->pluck('role')->toArray();
        // Or define roles statically if you prefer:
        // $roles = ['admin', 'rh', 'professeur', 'chef_service'];


        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'roles' => $roles, // Pass roles for filter dropdown
        ]);
    }

    public function create()
    {
        // Define roles statically for the creation form or fetch dynamically if preferred
        $availableRoles = ['admin', 'rh', 'professeur', 'chef_service']; // Match your User model enum/allowed values
        return Inertia::render($this->baseInertiaPath() . 'Create', [
            'availableRoles' => $availableRoles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['admin', 'rh', 'professeur', 'chef_service'])], // Ensure role is valid
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'email_verified_at' => now(), // Admin-created users are typically pre-verified
        ]);
        // event(new Registered($user)); // Usually not fired here, or a different admin-specific event

        return redirect()->route('admin.users.index')
            ->with('success', 'toasts.user_created_successfully');
    }

    public function edit(User $user)
    {
        $availableRoles = ['admin', 'rh', 'professeur', 'chef_service'];
        return Inertia::render($this->baseInertiaPath() . 'Edit', [
            'userToEdit' => $user, // Use a different prop name to avoid conflict with auth.user
            'availableRoles' => $availableRoles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'rh', 'professeur', 'chef_service'])],
        ]);

        $userData = $request->only('name', 'email', 'role');

        $user->update($userData);

        return redirect()->route('admin.users.index')
            ->with('success', 'toasts.user_updated_successfully');
    }

    public function destroy(User $user, Request $request)
    {
        // Prevent admin from deleting themselves
        if ($user->id === $request->user()->id) {
            return redirect()->route('admin.users.index')
                ->with('error', 'toasts.user_cannot_delete_self');
        }

        // Note: cascadeOnDelete on 'professeurs' table for 'user_id' will handle deleting associated professor record.
        // Add other checks if necessary (e.g., if user has critical system roles or data not covered by cascades).
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'toasts.user_deleted_successfully');
    }
}