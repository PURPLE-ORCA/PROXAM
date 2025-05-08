<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // RH user
        User::create([
            'name' => 'RH User',
            'email' => 'rh@example.com',
            'password' => Hash::make('password'),
            'role' => 'rh',
        ]);

        // Chef Service users (for services 1-10)
        for ($i = 1; $i <= 10; $i++) {
            User::create([
                'name' => "Chef Service $i",
                'email' => "chef$i@example.com",
                'password' => Hash::make('password'),
                'role' => 'chef_service',
            ]);
        }

        // Professor users (to cover user_id up to 40)
        for ($i = 1; $i <= 30; $i++) {
            User::create([
                'name' => "Professor User $i",
                'email' => "prof$i@example.com",
                'password' => Hash::make('password'),
                'role' => 'professeur',
            ]);
        }
    }
}
