<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

// tests\Feature\Auth\AuthenticationTest.php
test('users can authenticate using the login screen', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'), // Explicitly hash here for clarity
    ]);

    // Attempt to log in directly (bypassing the HTTP request for a moment)
    $attemptSuccessful = Auth::attempt([
        'email' => $user->email,
        'password' => 'password', // Raw password
    ]);
    dump("Auth::attempt result: " . ($attemptSuccessful ? 'Success' : 'Failure'));
    dump("Auth::check() after attempt: " . (Auth::check() ? 'Authenticated' : 'Not Authenticated'));
    dump("Auth::user() after attempt: ", Auth::user());

    // If the above direct attempt works, then try logging in via an HTTP request
    // If it doesn't work, the issue is deeper with how Auth::attempt interacts with your User model or session.

    // Reset auth state for the HTTP test
    Auth::logout(); // Ensure clean state before HTTP request

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    dump("--- After HTTP POST to login ---");
    dump("Auth::check() after POST: " . (Auth::check() ? 'Authenticated' : 'Not Authenticated'));
    dump("Auth::user() after POST: ", Auth::user());
    $response->dumpSession();

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});