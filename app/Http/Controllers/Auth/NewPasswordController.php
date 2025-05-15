<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Show the password reset page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

 /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::reset( // This uses the Password facade, which proxies to PasswordBroker
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user) use ($request) { // Type hint $user as App\Models\User for clarity
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                // <<< --- ADDED LOGIC STARTS HERE --- >>>
                // If the user's email is not yet verified (common for new profs using this flow for activation),
                // mark it as verified now that they've set their password.
                if (!$user->hasVerifiedEmail()) {
                    $user->markEmailAsVerified();
                    // Optionally, you could fire an EmailVerified event here if other parts of your app listen for it
                    // event(new \Illuminate\Auth\Events\Verified($user));
                }
                // <<< --- ADDED LOGIC ENDS HERE --- >>>

                event(new PasswordReset($user));
            }
        );

        // If the password was successfully reset, we will redirect the user back to
        // the application's login page with a success message.
        if ($status == Password::PASSWORD_RESET) { // Use constant for status check
            return redirect()->route('login')->with('status', __($status));
        }

        // If there is an error, we will redirect them back to where they came from
        // with their error message (typically shown on the reset password form).
        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
