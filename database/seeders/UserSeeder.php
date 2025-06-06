<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create SUPER ADMIN users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@p2e.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        User::create([
            'name' => 'Mohammed El Moussaoui',
            'email' => 'mohammed@p2e.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        User::create([
            'name' => 'Amira Mimri',
            'email' => 'amira@p2e.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create a specific RH user for testing
        User::create([
            'name' => 'RH User',
            'email' => 'rh@p2e.com',
            'password' => Hash::make('password'),
            'role' => 'rh',
            'email_verified_at' => now(),
        ]);
    }
}
