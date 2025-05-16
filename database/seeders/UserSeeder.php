<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
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

        // Create 19 more users with various roles
        $roles = ['professeur', 'rh', 'chef_service', 'admin'];
        
        for ($i = 1; $i < 20; $i++) {
            $role = $roles[array_rand($roles)];
            
            User::create([
                'name' => 'User ' . $i,
                'email' => 'user' . $i . '@p2e.com',
                'password' => Hash::make('password'),
                'role' => $role,
                'email_verified_at' => now(),
            ]);
        }
    }
}