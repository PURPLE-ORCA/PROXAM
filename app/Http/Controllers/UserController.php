<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Http\Requests\UserRequest;
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
        $usersQuery = User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->input('role'), fn($query, $role) => $query->where('role', $role))
            ->when($request->filled('verified'), function ($query) use ($request) {
                // We check if the 'verified' param is a string 'true' or 'false'
                $isVerified = filter_var($request->input('verified'), FILTER_VALIDATE_BOOLEAN);
                if ($isVerified) {
                    $query->whereNotNull('email_verified_at');
                } else {
                    $query->whereNull('email_verified_at');
                }
            });

        // --- NEW SORTING LOGIC ---
        $sortBy = $request->input('sortBy', 'name'); // Default sort by name
        $sortDirection = $request->input('sortDirection', 'asc'); // Default direction
        
        // Whitelist of sortable columns to prevent errors/injection
        $sortableColumns = ['name', 'email', 'role', 'email_verified_at'];
        if (in_array($sortBy, $sortableColumns)) {
            $usersQuery->orderBy($sortBy, $sortDirection);
        }
        // --- END NEW LOGIC ---

        $users = $usersQuery->paginate(40)->withQueryString();

        // Statically define the roles for consistency in forms and filters
        $availableRoles = ['admin', 'rh', 'professeur', 'chef_service'];

        return Inertia::render($this->baseInertiaPath() . 'Index', [
            'users' => $users,
            // Pass all filters back to the frontend
            'filters' => $request->all(['search', 'role', 'verified', 'sortBy', 'sortDirection']),
            'rolesForFilter' => $availableRoles,
            'rolesForForm' => $availableRoles,
        ]);
    }

    public function store(UserRequest $request)
    {
        $user = User::create($request->validated());
        $user->role = $request->validated('role');
        $user->save();

        return back()->with('success', 'User created successfully.');
    }

    public function update(UserRequest $request, User $user)
    {
        $user->update($request->validated());
        $user->role = $request->validated('role');
        $user->save();

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user, Request $request)
    {
        // Prevent admin from deleting themselves
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'User cannot delete self.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}
